import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, existsSync} from "node:fs";
import {join, resolve, dirname} from "node:path";

const site = resolve("site");
const pages = ["index.html", "learning-guide.html"];
const expected = [
  /Multirate signal processing/,
  /Linear prediction and filtering/,
  /Spectral estimation/,
  /Sparsity-aware signal processing/
];

for (const page of pages) {
  test(`${page}: four expandable major topics with summaries and nested subtopics`, () => {
    const html = readFileSync(join(site,page), "utf8");
    assert.equal((html.match(/<details class="topic-group"/g) || []).length, 4);
    assert.equal((html.match(/<summary>/g) || []).length >= 4,true);
    assert.equal((html.match(/<ul class="topic-subtopics">/g) || []).length, 4);
    const blocks = [...html.matchAll(/<details class="topic-group"[\s\S]*?<\/details>/g)].map(m=>m[0]);
    assert.equal(blocks.length,4);
    blocks.forEach((block, i) => {
      assert.match(block,/<summary>[\s\S]*?<\/summary>/);
      assert.match(block,expected[i]);
      assert.match(block,/<li>/);
    });
    // Native details/summary elements are keyboard-accessible without JS.
    assert.match(html, /<div class="topic-accordion" aria-label=/);
    assert.match(html, /<a class="skip-link" href="#main">/);
  });

  test(`${page}: original local lesson links resolve within published site`, () => {
    const html = readFileSync(join(site,page), "utf8");
    for(const href of [...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1])) {
      if (!href.startsWith("./") || href.includes("#")) continue;
      const location = resolve(dirname(join(site,page)),href);
      assert.ok(location.startsWith(site + "/"), `link escapes site: ${href}`);
      assert.ok(existsSync(location), `missing ${page} link: ${href}`);
    }
    assert.match(html,/visualizations\/periodogram\.html/);
    assert.match(html,/visualizations\/prediction\.html/);
  });
}

test("expanded topics have focus, visible contrast and mobile layout styles",()=>{
  const css=readFileSync(join(site,"assets/styles.css"),"utf8");
  for(const selector of [".topic-group[open]", ".topic-group summary:focus-visible", ".topic-content", ".topic-lesson", "@media(max-width:600px)"]) {
    assert.ok(css.includes(selector),`missing style: ${selector}`);
  }
});
