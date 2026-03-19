import { Helmet } from 'react-helmet-async'

const Meta = ({ title, description, keywords, image }) => {
  const siteTitle = "IEEE ERU | Official Student Branch";
  const defaultDesc = "IEEE Egyptian Russian University Student Branch is a premier technical community dedicated to innovation, leadership, and professional growth in Cairo, Egypt.";
  
  // High-Fidelity Mission Asset (Public Path)
  const defaultImg = "/og-preview.webp"; 
  const defaultKeywords = "IEEE, ERU, Egyptian Russian University, Student Branch, Engineering, Technology, Innovation, Student Activity, Egypt, Cairo, IEEE ERU SB";

  const fullTitle = title ? `${title} | IEEE ERU` : siteTitle;

  return (
    <Helmet>
      {/* 01. Standard Meta Protocol */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDesc} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />

      {/* 02. OpenGraph Protocol (Facebook, WhatsApp, LinkedIn) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDesc} />
      <meta property="og:image" content={image || defaultImg} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="IEEE ERU" />

      {/* 03. Twitter/X Protocol */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDesc} />
      <meta name="twitter:image" content={image || defaultImg} />

      {/* 04. Search Engine Indexing */}
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={window.location.href} />
    </Helmet>
  )
}

export default Meta
