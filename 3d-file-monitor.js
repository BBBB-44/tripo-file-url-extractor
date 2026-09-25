(() => {
  // Common 3D / model extensions
  const EXTS = [
    'glb', 'gltf', 'fbx', 'obj', 'stl', 'dae', '3ds', 'blend',
    'usd', 'usda', 'usdc', 'usdz', 'abc', 'ply', 'x3d', 'wrl',
    'vrm', 'vox', 'babylon', 'max', 'ma', 'mb', 'c4d'
  ];

  const seen = new Map(); // url -> { type, status, size, time }

  const is3D = (url = '') => {
    try {
      const path = new URL(url, location.href).pathname.toLowerCase();
      return EXTS.some(ext => path.endsWith('.' + ext) || path.includes('.' + ext + '?'));
    } catch {
      return false;
    }
  };

  // ---- PerformanceResourceTiming (already loaded resources) ----
  performance.getEntriesByType('resource').forEach(entry => {
    if (is3D(entry.name)) {
      seen.set(entry.name, {
        type: 'resource',
        status: 'loaded',
        size: entry.transferSize || entry.decodedBodySize || 0,
        time: entry.responseEnd
      });
    }
  });

  // ---- PerformanceObserver (future resources) ----
  const obs = new PerformanceObserver(list => {
    list.getEntries().forEach(entry => {
      if (is3D(entry.name) && !seen.has(entry.name)) {
        seen.set(entry.name, {
          type: 'resource',
          status: 'loaded',
          size: entry.transferSize || entry.decodedBodySize || 0,
          time: entry.responseEnd
        });
        console.log('%c[3D] ' + entry.name, 'color:#0f0');
      }
    });
  });
  obs.observe({ type: 'resource', buffered: true });

  // ---- Fetch / XHR interception (covers many loaders) ----
  const origFetch = window.fetch;
  window.fetch = async function (...args) {
    const res = await origFetch.apply(this, args);
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    if (is3D(url) && !seen.has(url)) {
      seen.set(url, { type: 'fetch', status: res.status, size: 0, time: performance.now() });
      console.log('%c[3D fetch] ' + url, 'color:#0ff');
    }
    return res;
  };

  const OrigXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function () {
    const xhr = new OrigXHR();
    const open = xhr.open;
    xhr.open = function (method, url, ...rest) {
      this._url = url;
      return open.call(this, method, url, ...rest);
    };
    xhr.addEventListener('load', function () {
      if (is3D(this._url) && !seen.has(this._url)) {
        seen.set(this._url, {
          type: 'xhr',
          status: this.status,
          size: this.response?.byteLength || 0,
          time: performance.now()
        });
        console.log('%c[3D xhr] ' + this._url, 'color:#ff0');
      }
    });
    return xhr;
  };

  // ---- Helper to dump the list ----
  window.list3DFiles = () => {
    console.group('%c3D / Model files found', 'color:#0f0;font-weight:bold');
    if (seen.size === 0) {
      console.log('None yet. Navigate or reload the page.');
    } else {
      [...seen.entries()].forEach(([url, info], i) => {
        console.log(
          `${i + 1}. %c${url}`,
          'color:#8cf',
          `\n   type: ${info.type} | status: ${info.status} | size: ${info.size || '?'} bytes`
        );
      });
    }
    console.groupEnd();
    return [...seen.keys()];
  };

  // ---- Also expose raw map ----
  window._3dFiles = seen;

  console.log(
    '%c3D file monitor active.\n' +
    '• Matches appear live in console\n' +
    '• Call list3DFiles() to dump all\n' +
    '• Access raw data: _3dFiles',
    'color:#0f0;font-weight:bold'
  );

  // Initial dump of anything already loaded
  if (seen.size) list3DFiles();
})();
