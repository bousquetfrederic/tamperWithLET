// ==UserScript==
// @name         LET Disable Drafts
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Blocks the draft/autosave feature on LowEndTalk
// @author       Frederic
// @match        https://lowendtalk.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Remove or disable the draft-saving function
    const blockDrafts = () => {
        // Vanilla Forums uses localStorage for drafts
        try {
            localStorage.removeItem('Draft');
            localStorage.removeItem('Drafts');
        } catch(e) {}

        // Override the saveDraft function if present
        if (typeof window.saveDraft === 'function') {
            window.saveDraft = () => {};
        }

        // Kill any autosave intervals
        if (window.draftTimer) {
            clearInterval(window.draftTimer);
            window.draftTimer = null;
        }
    };

    // Run once on load
    blockDrafts();

    // Also run whenever AJAX loads new comment boxes
    const observer = new MutationObserver(blockDrafts);
    observer.observe(document.body, { childList: true, subtree: true });
})();
