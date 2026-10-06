import React from 'react';
import { Link } from 'react-router-dom';
import './info.css';

function Info() {
  return (
    <div className="info-page">
      <h2>About Parcelhus Finder</h2>
      <p>
        Parcelhus Finder is a research project by Morten Sylvest Nøhr<br /><br />
       
        Website: <a href="https://stofogluft.dk/" target="_blank" rel="noopener noreferrer">https://stofogluft.dk/</a><br />
        Linkedin: <a href="https://www.linkedin.com/in/mortensylvestnoehr/" target="_blank" rel="noopener noreferrer">https://www.linkedin.com/in/mortensylvestnoehr/</a><br /><br />

        Podcast created with Google Notebook LM<br />
        Source Material here:<br />
        Baggrund.com: <a href="https://baggrund.com/2017/01/22/parcelhuspionerer-parcelhusdanmark-og-almindelighedens-historie/" target="_blank" rel="noopener noreferrer">https://baggrund.com/2017/01/22/parcelhuspionerer-parcelhusdanmark-og-almindelighedens-historie/</a><br />
        Bolius.dk: <a href="https://www.bolius.dk/parcelhusets-arkitektur-og-historie-17537" target="_blank" rel="noopener noreferrer">https://www.bolius.dk/parcelhusets-arkitektur-og-historie-17537</a><br />
        Arbejdermuseet: <a href="https://www.arbejdermuseet.dk/viden-samlinger/arbejderhistorien/plads-til-os-alle/baggaard-beton-boligbevaegelsen/parcelhusboomet/" target="_blank" rel="noopener noreferrer">https://www.arbejdermuseet.dk/viden-samlinger/arbejderhistorien/plads-til-os-alle/baggaard-beton-boligbevaegelsen/parcelhusboomet/</a><br /><br />

        Image generator powered by FLUX: https://fal.ai/models/fal-ai/flux-pro<br />
        LORA model source material here: <a href="https://miro.com/welcomeonboard/M2ZqSTRmZjM2Q29GUFdrY0gwSm5hWEJhTjc4RW01Q0lCQ245VGZsQlRlVU5adDMyZXBzSWw3dHpQTVJKS05VRnwzNDU4NzY0NTk3OTExMzM2OTc2fDI=?share_link_id=491474875063" target="_blank" rel="noopener noreferrer">https://miro.com/welcomeonboard/M2ZqSTRmZjM2Q29GUFdrY0gwSm5hWEJhTjc4RW01Q0lCQ245VGZsQlRlVU5adDMyZXBzSWw3dHpQTVJKS05VRnwzNDU4NzY0NTk3OTExMzM2OTc2fDI=?share_link_id=491474875063</a>
      </p>

      <Link to="/" className="back-link">Back to Parcelhus Finder</Link>
      <p2><br /><br /><br /><br />
      Info on "Parcelhuse": The Development of Parcelhus in Denmark<br /><br />

Parcelhouses in Denmark have a rich history that dates back to the 1850s. In the beginning, Parcelhus, also known as villas, were primarily a privilege of the upper bourgeoisie in Copenhagen. As time went on, and especially after World War II, the Parcelhus became more accessible to the average Danish family.<br /><br />

Building Associations and Government Loans:<br /><br />
Before World War II, building associations helped workers to own their own homes. After the war, government loans contributed to making Parcelhus more accessible for large families. These government loans had specific requirements regarding the size and price of the house to keep costs down.<br /><br />

Type Houses and Mass Production:<br /><br />
In the 1960s, Denmark experienced an explosion in type house construction. Type houses were standardized and mass-produced, making them affordable for the average family. This period marked a significant change in Danish housing culture, where the Parcelhus became a symbol of welfare and prosperity.<br /><br />

Layout and Development:<br /><br />
The layout of a Parcelhus has changed over time, reflecting changes in lifestyle and societal trends. In the 1970s, the open-plan room became popular, inspired by communal housing.<br /><br />

Economic and Social Changes:<br /><br />
The economic benefits of owning a Parcelhus have played a role in its popularity. Interest deductions made homeownership attractive, especially in the 1970s. Although the interest deduction was later reduced, owning a Parcelhus remained an attractive investment for many Danes.<br /><br />

Parcelhpuses Today:<br /><br />
Today, Parcelhus are still a popular form of housing in Denmark. The prevailing trend is individualization, where homeowners increasingly choose houses that reflect their personal tastes and needs. Sustainable construction has also become an important factor in modern Parcelhus design.<br /><br />
</p2>
</div>
  );
}

export default Info;