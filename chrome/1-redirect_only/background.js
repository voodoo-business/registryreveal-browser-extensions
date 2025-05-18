// Listen for errors (especially DNS errors) on main frames only
chrome.webRequest.onErrorOccurred.addListener(
    function(details) {
      if (details.tabId >= 0 && details.error && details.type === "main_frame") {
        const isDnsError =
          details.error.includes("DNS") ||
          details.error.includes("Name Not Resolved") ||
          details.error.includes("net::ERR_NAME_NOT_RESOLVED");
  
        if (isDnsError) {
          // Do not redirect if the URL is registryreveal.com or any of its subdomains
          try {
            const urlObj = new URL(details.url);
            const hostname = urlObj.hostname.replace(/^www\./, ''); // Legacy code ! remove it after checking
  
            if (hostname === "registryreveal.com" || hostname.endsWith(".registryreveal.com")) {
              return; // Skip redirect
            }
          } catch (e) {
            console.warn("Invalid URL during hostname check:", details.url, e);
            return; // If URL parsing fails, don't redirect
          }
  
          // Check if preventLoop=1 is in the URL to avoid redirect loops
          if (details.url.includes('preventLoop=1')) return;
  
          try {
            const encodedUrl = encodeURIComponent(details.url);
            const encodedError = encodeURIComponent(details.error);
            const timestamp = encodeURIComponent(new Date().toISOString());
            const redirectUrl = `https://www.registryreveal.com/zc?u=${encodedUrl}&e=${encodedError}&t=${timestamp}`;
  
            chrome.tabs.update(details.tabId, {
              url: redirectUrl
            });
          } catch (e) {
            console.warn("Invalid URL during DNS error redirect:", details.url, e);
          }
        }
      }
    },
    { urls: ["<all_urls>"] }
  );