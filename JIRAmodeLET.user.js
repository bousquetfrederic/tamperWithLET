// ==UserScript==
// @name         LowEndTalk JIRA Theme (Optimized Compact)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  JIRA-style theme with early style injection; grayscale avatars except Frederic's in colour; visible profile counts; clickable JIRA logo
// @match        https://lowendtalk.com/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  GM_addStyle(`
    /* Base white surfaces */
    body, .Page, .Content, .BoxFilter, .BoxDiscussionFilter, .BoxCategories,
    .Tabs.DiscussionTabs, .Breadcrumbs, .BreadcrumbsWrapper, .PageHeading,
    .TitleBar, .PanelCategories, .Category, .ItemLink, .FilterMenu li,
    .Aside, .Count, .BoxInThisDiscussion, .PanelInThisDiscussion,
    .Meta.CommentMeta.CommentInfo, .Meta.DiscussionMeta, .editor-help-text {
      background:#fff!important; border:none!important;
    }

    /* JIRA blue text */
    a, .DiscussionLink, .Title a, .Author, .Username,
    .PanelInThisDiscussion a, .PanelInThisDiscussion .Username,
    .Meta.CommentMeta.CommentInfo a, .Meta.CommentMeta.CommentInfo time,
    .Meta.DiscussionMeta a, .Meta.DiscussionMeta time,
    .Meta.DiscussionMeta .DateUpdated, .editor-help-text a {
      color:#0052CC!important;
    }
    a:hover, .DiscussionLink:hover, .Title a:hover, .Author a:hover,
    .Username a:hover, .PanelInThisDiscussion a:hover,
    .Meta.CommentMeta.CommentInfo a:hover, .Meta.DiscussionMeta a:hover,
    .editor-help-text a:hover { color:#0747A6!important; }

    /* Section headers */
    .BoxCategories h4, .PanelCategories h4, .BoxInThisDiscussion h4 {
      color:#0052CC!important; font-weight:600!important; border:none!important;
    }

    /* Header bar */
    .Head, .Header, .Banner, .SiteHeader { background:#0052CC!important; border:none!important; }
    .Head a, .Header a, .Banner a, .SiteHeader a { color:#fff!important; }

    /* Buttons */
    .Button, .PreviewButton, .DraftButton, .PostCommentButton {
      background:#fff!important; border:1px solid #0052CC!important; color:#0052CC!important;
    }
    .Button:hover, .PreviewButton:hover, .DraftButton:hover, .PostCommentButton:hover {
      background:#DEEBFF!important; color:#0747A6!important;
    }

    /* Badge */
    .HasNew.NewCommentCount { background:#0052CC!important; color:#fff!important; padding:2px 6px; border-radius:4px; }
    .HasNew.NewCommentCount .Number { color:#fff!important; }

    /* Pager current */
    .Pager a.Pager-p[aria-current="page"], .Pager a.Pager-p.Highlight {
      background:#0052CC!important; color:#fff!important; border:1px solid #0052CC!important;
      border-radius:4px!important; font-weight:700!important; text-decoration:none!important;
    }

    /* Footer */
    #Foot { background:#0052CC!important; color:#fff!important; padding:12px!important; font-size:12px!important; }
    #Foot a { color:#fff!important; text-decoration:none!important; }
    #Foot a:hover { color:#DEEBFF!important; text-decoration:underline!important; }
    #Foot img { filter:brightness(0) invert(1)!important; }

    /* Sprite icons blue */
    .Sprite, .Sprite16, .SpNotifications {
      filter:invert(29%) sepia(95%) saturate(748%) hue-rotate(191deg) brightness(92%) contrast(101%)!important;
    }

    /* Hide unwanted base64 SVG span */
    span[style*="data:image/svg+xml"] { display:none!important; }

    /* Profile photos: grayscale by default */
    img.ProfilePhoto, img.ProfilePhotoMedium, img.ProfilePhotoLarge { filter:grayscale(100%)!important; }
    /* Exception: Frederic's avatar stays in colour (any size/file from /userpics/807/) */
    img.ProfilePhoto[src*="/userpics/807/"],
    img.ProfilePhotoMedium[src*="/userpics/807/"],
    img.ProfilePhotoLarge[src*="/userpics/807/"] { filter:none!important; }

    /* Announcement tag */
    .Tag.Tag-Announcement { background:#0052CC!important; color:#fff!important; border-radius:4px!important; padding:2px 6px!important; font-weight:600!important; }

    /* Profile counts: show all numbers */
    .FilterMenu .Count, .FilterMenu .Count .Number { color:#0052CC!important; font-weight:600!important; }
    .FilterMenu .Count { background:none!important; }
  `);

  /* Replace brand/title with "JIRA" and keep it clickable */
  function replaceLogo(root = document) {
    const selectors = [
      '.Head .Title a',
      '.Header .Title a',
      '.SiteTitle a',
      '.Brand a',
      '.Logo a',
      '.Head .Title',
      '.Header .Title',
      '.SiteTitle',
      '.Brand',
      '.Logo'
    ];
    let el = null;
    for (const sel of selectors) {
      const found = root.querySelector(sel);
      if (found) { el = found; break; }
    }
    if (!el) return;
    if (el.dataset && el.dataset.jiraBrand === 'done') return;

    if (el.tagName && el.tagName.toLowerCase() !== 'a') {
      const link = document.createElement('a');
      link.href = 'https://lowendtalk.com/';
      link.style.color = '#fff';
      link.textContent = 'JIRA';
      el.innerHTML = '';
      el.appendChild(link);
      el = link;
    } else {
      el.textContent = 'JIRA';
      el.href = 'https://lowendtalk.com/';
      el.style.color = '#fff';
    }

    if (el.dataset) el.dataset.jiraBrand = 'done';
  }

  const observer = new MutationObserver(() => replaceLogo(document));
  observer.observe(document.documentElement, { childList: true, subtree: true });

  replaceLogo(document);

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.HasNew.NewCommentCount').forEach(el => {
      el.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().toLowerCase() === 'new') {
          node.textContent = ' comments from your manager';
        }
      });
      if (el.title) el.title = el.title.replace(/new/i, 'comments from your manager');
    });
  });
})();
