import React, { useEffect } from 'react';

interface MetaProps {
  title?: string;
  description?: string;
  keywords?: string;
}

const Meta: React.FC<MetaProps> = ({ 
  title = "THE ARCHITECH | Enterprise AI Authority", 
  description = "Elite intelligence orchestration and production-grade AI asset deployment for the next generation of business efficiency.",
  keywords = "enterprise ai, ai authority, orchestrator, autonomous agents, ai strategy, digital assets, ai consulting"
}) => {
  useEffect(() => {
    document.title = title;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = "description";
      meta.content = description;
      document.head.appendChild(meta);
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    } else {
      const meta = document.createElement('meta');
      meta.name = "keywords";
      meta.content = keywords;
      document.head.appendChild(meta);
    }
  }, [title, description, keywords]);

  return null;
};

export default Meta;
