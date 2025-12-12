// ==UserScript==
// @name         LET Drafts Everywhere Blocker (with logs)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Blocks all draft/autosave requests and storage on LowEndTalk, with console logs
// @author       Frederic
// @match        https://lowendtalk.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const draftUrlRegex = /(draft|autosave|post\/comment)/i;
  const draftKeyRegex = /(draft|autosave|comment)/i;

  function purgeStorage() {
    [localStorage, sessionStorage].forEach(store => {
      for (let i = store.length - 1; i >= 0; i--) {
        const key = store.key(i);
        if (draftKeyRegex.test(key)) {
          console.log("Draft storage blocked:", key);
          store.removeItem(key);
        }
      }
    });
  }

  function patchStorage() {
    const lsSet = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, value) {
      if (draftKeyRegex.test(String(key))) {
        console.log("Draft storage write blocked:", key);
        return;
      }
      return lsSet(key, value);
    };
    const ssSet = sessionStorage.setItem.bind(sessionStorage);
    sessionStorage.setItem = function (key, value) {
      if (draftKeyRegex.test(String(key))) {
        console.log("Draft session write blocked:", key);
        return;
      }
      return ssSet(key, value);
    };
  }

  function patchXHR() {
    const OrigXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function () {
      const xhr = new OrigXHR();
      const origOpen = xhr.open;
      xhr.open = function (method, url, ...rest) {
        if (draftUrlRegex.test(String(url))) {
          console.log("Draft XHR blocked:", url);
          return origOpen.call(xhr, method, 'about:blank', ...rest);
        }
        return origOpen.call(xhr, method, url, ...rest);
      };
      return xhr;
    };
    window.XMLHttpRequest.prototype = OrigXHR.prototype;
  }

  function patchFetch() {
    const origFetch = window.fetch.bind(window);
    window.fetch = function (input, init) {
      const url = typeof input === 'string' ? input : (input && input.url) || '';
      if (draftUrlRegex.test(String(url))) {
        console.log("Draft fetch blocked:", url);
        return Promise.resolve(new Response('', { status: 204 }));
      }
      return origFetch(input, init);
    };
  }

  function neuterFunctions() {
    if (typeof window.saveDraft === 'function') {
      window.saveDraft = () => { console.log("saveDraft function blocked"); };
    }
    if (window.draftTimer) {
      clearInterval(window.draftTimer);
      window.draftTimer = null;
      console.log("Draft timer cleared");
    }
  }

  function init() {
    purgeStorage();
    patchStorage();
    patchXHR();
    patchFetch();
    neuterFunctions();
  }

  init();
  const observer = new MutationObserver(init);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
