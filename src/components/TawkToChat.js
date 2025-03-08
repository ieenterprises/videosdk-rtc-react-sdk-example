
import React, { useEffect, useState } from 'react';

const TawkToChat = ({ isVisible = true }) => {
  const [tawkLoaded, setTawkLoaded] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      // Remove any existing Tawk elements if not visible
      cleanupTawk();
      return;
    }

    // Create container div
    const containerDiv = document.createElement('div');
    containerDiv.id = 'tawk_6616a163a0c6737bd12a56c8';
    document.body.appendChild(containerDiv);
    
    // Create and insert Tawk.to script
    var Tawk_API = window.Tawk_API || {};
    var Tawk_LoadStart = new Date();
    Tawk_API.embedded = 'tawk_6616a163a0c6737bd12a56c8';
    
    const script = document.createElement("script");
    script.id = 'tawk-to-script';
    script.async = true;
    script.src = 'https://embed.tawk.to/6616a163a0c6737bd12a56c8/1ilrgsu2o';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    
    document.body.appendChild(script);
    
    setTawkLoaded(true);

    // Clean up function to remove the script and container when component unmounts
    return () => {
      cleanupTawk();
    };
  }, [isVisible]);

  const cleanupTawk = () => {
    // Remove the Tawk script
    const tawkScript = document.getElementById('tawk-to-script');
    if(tawkScript) {
      tawkScript.remove();
    }
    
    // Remove the container
    const containerDiv = document.getElementById('tawk_6616a163a0c6737bd12a56c8');
    if (containerDiv) {
      containerDiv.remove();
    }
    
    // Remove Tawk iframe and widget elements
    const tawkIframes = document.querySelectorAll('iframe[src*="tawk.to"]');
    tawkIframes.forEach(iframe => iframe.remove());
    
    const tawkWidgets = document.querySelectorAll('.tawk-min-container, .tawk-card, .tawk-chat-panel');
    tawkWidgets.forEach(widget => widget.remove());
    
    // Reset Tawk API if it exists
    if (window.Tawk_API) {
      if (typeof window.Tawk_API.hideWidget === 'function') {
        window.Tawk_API.hideWidget();
      }
      if (typeof window.Tawk_API.destroy === 'function') {
        window.Tawk_API.destroy();
      }
    }
    
    setTawkLoaded(false);
  };

  return null;
};

export default TawkToChat;
