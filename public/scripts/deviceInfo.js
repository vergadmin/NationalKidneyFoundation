function parseUserAgent(userAgent) {
    let platform = 'Unknown';
    let operatingSystem = 'Unknown';
    let browser = 'Unknown';
  
    // Detect platform
    if (/Windows/.test(userAgent)) {
      platform = 'Windows';
    } else if (/Macintosh/.test(userAgent)) {
      platform = 'Mac';
    } else if (/Linux/.test(userAgent)) {
      platform = 'Linux';
    } else if (/Android/.test(userAgent)) {
      platform = 'Android';
    } else if (/iPhone|iPad|iPod/.test(userAgent)) {
      platform = 'iOS';
    }
  
    // Detect operating system
    if (/Windows NT 10/.test(userAgent)) {
      operatingSystem = 'Windows 10';
    } else if (/Windows NT 6.3/.test(userAgent)) {
      operatingSystem = 'Windows 8.1';
    } else if (/Windows NT 6.2/.test(userAgent)) {
      operatingSystem = 'Windows 8';
    } else if (/Windows NT 6.1/.test(userAgent)) {
      operatingSystem = 'Windows 7';
    } else if (/Mac OS X (\d+[\.\_\d]+)/.test(userAgent)) {
      operatingSystem = `Mac OS X ${RegExp.$1.replace('_', '.')}`;
    } else if (/Android (\d+[\.\_\d]+)/.test(userAgent)) {
      operatingSystem = `Android ${RegExp.$1}`;
    } else if (/iPhone OS (\d+[\.\_\d]+)/.test(userAgent)) {
      operatingSystem = `iPhone OS ${RegExp.$1.replace('_', '.')}`;
    } else if (/iPad.* OS (\d+[\.\_\d]+)/.test(userAgent)) {
      operatingSystem = `iPad OS ${RegExp.$1.replace('_', '.')}`;
    } else if (/Linux/.test(userAgent)) {
      operatingSystem = 'Linux';
    }
  
    // Detect browser
    if (/Chrome\/(\d+[\.\d]+)/.test(userAgent) && !/Edge/.test(userAgent)) {
      browser = `Chrome ${RegExp.$1}`;
    } else if (/Safari\/(\d+[\.\d]+)/.test(userAgent) && !/Chrome/.test(userAgent)) {
      browser = `Safari ${RegExp.$1}`;
    } else if (/Firefox\/(\d+[\.\d]+)/.test(userAgent)) {
      browser = `Firefox ${RegExp.$1}`;
    } else if (/MSIE (\d+[\.\d]+)/.test(userAgent)) {
      browser = `Internet Explorer ${RegExp.$1}`;
    } else if (/Trident.*rv:(\d+[\.\d]+)/.test(userAgent)) {
      browser = `Internet Explorer ${RegExp.$1}`;
    } else if (/Edge\/(\d+[\.\d]+)/.test(userAgent)) {
      browser = `Edge ${RegExp.$1}`;
    }
  
    return { platform, operatingSystem, browser };
  }