// MIT License
// Copyright (c) 2021 @markedjs
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.


function markedHighlight(options) {
  if (typeof options === 'function') {
    options = {
      highlight: options
    };
  }

  if (!options || typeof options.highlight !== 'function') {
    throw new Error('Must provide highlight function');
  }

  if (typeof options.langPrefix !== 'string') {
    options.langPrefix = 'language-';
  }

  return {
    async: !!options.async,
    walkTokens(token) {
      if (token.type !== 'code') {
        return;
      }

      const lang = getLang(token.lang);

      if (options.async) {
        return Promise.resolve(options.highlight(token.text, lang, token.lang || '')).then(updateToken(token));
      }

      const code = options.highlight(token.text, lang, token.lang || '');
      if (code instanceof Promise) {
        throw new Error('markedHighlight is not set to async but the highlight function is async. Set the async option to true on markedHighlight to await the async highlight function.');
      }
      updateToken(token)(code);
    },
    renderer: {
      code(code, infoString, escaped) {
        const lang = getLang(infoString);
        const classAttr = lang
          ? ` class="${options.langPrefix}${escape(lang)}"`
          : '';
        code = code.replace(/\n$/, '');
        return `<pre><code${classAttr}>${escaped ? code : escape(code, true)}\n</code></pre>`;
      }
    }
  };
}

function getLang(lang) {
  return (lang || '').match(/\S*/)[0];
}

function updateToken(token) {
  return (code) => {
    if (typeof code === 'string' && code !== token.text) {
      token.escaped = true;
      token.text = code;
    }
  };
}

// copied from marked helpers
const escapeTest = /[&<>"']/;
const escapeReplace = new RegExp(escapeTest.source, 'g');
const escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
const escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, 'g');
const escapeReplacements = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};
const getEscapeReplacement = (ch) => escapeReplacements[ch];
function escape(html, encode) {
  if (encode) {
    if (escapeTest.test(html)) {
      return html.replace(escapeReplace, getEscapeReplacement);
    }
  } else {
    if (escapeTestNoEncode.test(html)) {
      return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
    }
  }

  return html;
}
