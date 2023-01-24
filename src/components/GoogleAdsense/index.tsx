import React, { useEffect } from "react";

export const Adsense = () => {
  useEffect(() => {
    try {
      //@ts-ignore
      const adsbygoogle = window.adsbygoogle || [];
      adsbygoogle.push({});
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-6999866360689095"
      data-ad-slot="6568222285"
      data-ad-layout="in-article"
      data-ad-format="fluid"
    />
  );
};
