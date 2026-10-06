// One-off repair for gallery entries whose imageUrl is a signed URL that stopped
// working (SignatureDoesNotMatch after Google rotated the signing key).
// Gives each image a Firebase download token and rewrites the URL in the database.
//
// Dry run (default, read-only):  node scripts/fix-gallery-urls.js
// Apply changes:                 node scripts/fix-gallery-urls.js --apply
//
// Needs Google credentials: gcloud auth application-default login
const admin = require('firebase-admin');
const crypto = require('crypto');

const apply = process.argv.includes('--apply');

admin.initializeApp({
  projectId: "parcelhusfinderv6v3",
  storageBucket: "parcelhusfinderv6v3.appspot.com",
  databaseURL: "https://parcelhusfinderv6v3-default-rtdb.europe-west1.firebasedatabase.app"
});

const bucket = admin.storage().bucket();

function storagePathFromUrl(url) {
  const u = new URL(url);
  if (u.hostname === 'firebasestorage.googleapis.com') {
    return decodeURIComponent(u.pathname.split('/o/')[1]);
  }
  if (u.hostname === 'storage.googleapis.com') {
    // /<bucket>/<path>
    return decodeURIComponent(u.pathname.split('/').slice(2).join('/'));
  }
  return null;
}

async function main() {
  const snapshot = await admin.database().ref('gallery').get();
  const entries = Object.entries(snapshot.val() || {});
  const counts = { ok: 0, fixed: 0, missingFile: 0, skipped: 0 };

  for (const [key, entry] of entries) {
    const url = entry.imageUrl || '';
    if (url.startsWith('https://firebasestorage.googleapis.com/') && url.includes('token=')) {
      counts.ok++;
      continue;
    }
    const path = url && storagePathFromUrl(url);
    if (!path) {
      console.log(`skip ${key}: unrecognised URL ${url.slice(0, 80)}`);
      counts.skipped++;
      continue;
    }
    const file = bucket.file(path);
    const [exists] = await file.exists();
    if (!exists) {
      console.log(`missing ${key}: ${path} is not in Storage`);
      counts.missingFile++;
      continue;
    }

    const [metadata] = await file.getMetadata();
    const existingTokens = metadata.metadata && metadata.metadata.firebaseStorageDownloadTokens;
    const token = existingTokens ? existingTokens.split(',')[0] : crypto.randomUUID();
    const newUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;

    console.log(`${apply ? 'fix' : 'would fix'} ${key}: ${path}`);
    if (apply) {
      if (!existingTokens) {
        await file.setMetadata({ metadata: { firebaseStorageDownloadTokens: token } });
      }
      await admin.database().ref(`gallery/${key}/imageUrl`).set(newUrl);
    }
    counts.fixed++;
  }

  console.log(`\n${entries.length} gallery entries:`, counts, apply ? '' : '(dry run, nothing changed)');
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
