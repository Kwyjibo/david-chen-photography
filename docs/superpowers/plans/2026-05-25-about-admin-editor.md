# About Page Admin Editor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an "About" tab to the admin that lets David edit the About Me bio and testimonials, and make the About section on the public site read from `gallery-config.json` instead of being hardcoded.

**Architecture:** `config.about` is added to the existing Cloudinary-hosted `gallery-config.json`. `migrateConfig()` in the admin seeds the object on first load. The admin gets a new "About" panel (same pattern as Pricing/Contact). The public `index.html` About section is emptied of hardcoded content and filled at runtime by a new `renderAbout()` function.

**Tech Stack:** Vanilla JS, HTML, Cloudinary (config storage). No build step. Netlify Functions (no changes needed).

---

## File Map

| File | Change |
|------|--------|
| `dawei-admin/index.html` | Extend `migrateConfig()` (line ~377); add `<div class="panel" id="panel-about">` (line ~209); add About tab in `renderTabs()` (line ~523); add `renderAboutPanel()`, `buildTestimonialCardHTML()`, `readAboutFromDOM()`, `saveAboutChanges()`, `addTestimonialCard()`, `removeTestimonialCard()`, `moveTestimonialCard()` JS functions (after `renderContactPanel` block) |
| `index.html` | Replace hardcoded About HTML content with empty `id`-bearing containers (lines 275-280, 289-322); add `renderAbout(config)` function (after `renderContact` at line ~668); call `renderAbout(config)` inside `init()` (line ~698) |

---

## Task 1: Seed `config.about` in `migrateConfig()`

**Files:**
- Modify: `dawei-admin/index.html` (lines 377–423, the `migrateConfig` function)

- [ ] **Step 1: Locate the end of `migrateConfig()`**

Open `dawei-admin/index.html`. Find the `migrateConfig(cfg)` function (around line 377). The last block before `return cfg;` adds `cfg.contact.bioFontSize` defaults (around line 422). You will add the `cfg.about` migration block immediately before `return cfg;`.

- [ ] **Step 2: Add the about migration block**

Insert this block immediately before `return cfg;` at the end of `migrateConfig()`:

```javascript
  // Add about defaults if missing
  if (!cfg.about) {
    cfg.about = {
      bio: "The best family photos don't look like photo sessions. They look like a real day out where everyone was actually having fun and someone happened to be there with a camera.\n\nWith 15 years of shooting kids and families across Westchester's parks and trails, knowing these locations as well as I do means planning every shoot around the best light, getting the most out of wherever we are, and being ready for the moment right before someone laughs or a kid forgets there's even a camera. A lot of the families I shoot keep coming back, and there's nothing quite like watching the kids grow up through photos.\n\nBackyard sessions are also an option for families who prefer shooting close to home. There's something about a familiar space that makes kids more comfortable, and that comfort shows up in the photos.\n\nI don't rush, I don't force poses, and I give kids time to warm up to me before I start shooting. Parents are usually surprised by how relaxed the whole thing feels, and how different the photos look because of it.\n\nI typically work with kids 5 and up, and if you've been putting off booking because you're convinced your kids won't cooperate, that's exactly the kind of session I'm used to.",
      testimonials: [
        { id: 't-default-1', name: 'Priya S.', text: 'When the gallery hit my inbox I opened it alone at my kitchen table and completely lost it. There was one shot of my daughter laughing with my mom that I will treasure forever. David has this ability to catch the real moments, not the posed stiff ones, and that’s what makes his work different. My whole family has been asking for prints and we haven’t even had a chance to order them yet.' },
        { id: 't-default-2', name: 'Emily D.', text: 'My son is painfully shy around strangers and I fully expected a meltdown within the first five minutes. David got down on his level, cracked a few jokes, and within ten minutes my kid was running up to him like they were best friends. The shots of him actually smiling and being himself are something I’ve never been able to get before. I don’t know how he does it but we are not going back to anyone else.' },
        { id: 't-default-3', name: 'Ashley R.', text: 'I was nervous about booking a shoot with my two toddlers because they never cooperate for pictures. David was so calm and playful with them the whole time, and somehow he got the most natural, genuine smiles out of both of them. He also kept checking in with me to make sure I was comfortable and having a good time. I will 100% be booking him again next year.' },
        { id: 't-default-4', name: 'Megan T.', text: 'The way David sees light is something else. Our evening shoot had this gorgeous golden glow in so many of the photos and I genuinely don’t know how he found the right angles every time. He also took way more shots than I expected, so we had a huge variety to pick from. Our walls are covered in these photos now.' },
        { id: 't-default-5', name: 'Sarah M.', text: 'David is honestly the most patient photographer I’ve ever worked with. He never made us feel like we were on a clock and kept suggesting fun new spots around the location we hadn’t even thought of. By the end of the session we had so many different looks to choose from. The photos turned out better than I could have imagined.' },
        { id: 't-default-6', name: 'Mei L.', text: 'I had a few specific requests going into our shoot and honestly felt a little awkward asking for them. David was completely unfazed and went out of his way to make every one of them happen, plus added a few ideas of his own that I ended up loving even more. He made the whole experience feel easy and fun instead of stressful. These are the best family photos we have ever taken.' },
        { id: 't-default-7', name: 'Lauren K.', text: 'Before our shoot David walked me through exactly what to expect, what to wear, how the editing process works and when to expect the final gallery. No surprises, no waiting around wondering what comes next. The pictures came back faster than I expected and every single one was stunning. It felt like he really understood the kind of memories we were trying to capture.' },
        { id: 't-default-8', name: 'Chris W.', text: 'I’ve worked with photographers who take weeks to deliver and you’re left completely in the dark the whole time. David had our full gallery ready so quickly I actually had to double check it was all there. Every photo was edited and looked polished, not like a rough batch he just threw together. He clearly takes his work seriously and it shows.' }
      ]
    };
  }
```

- [ ] **Step 3: Verify the migration block is placed correctly**

`migrateConfig()` should now end like:

```javascript
  // Add about defaults if missing
  if (!cfg.about) {
    cfg.about = { ... };
  }
  return cfg;
}
```

- [ ] **Step 4: Commit**

```bash
git add dawei-admin/index.html
git commit -m "feat: seed config.about in migrateConfig with bio and testimonials defaults"
```

---

## Task 2: Add the About static panel div to admin HTML

**Files:**
- Modify: `dawei-admin/index.html` (around line 204–209, where `panel-pricing` and `panel-contact` divs are)

- [ ] **Step 1: Find the existing static panel divs**

In `dawei-admin/index.html`, locate these two lines (around line 204):

```html
    <!-- Pricing Editor Panel -->
    <div class="panel" id="panel-pricing"></div>

    <!-- Contact Editor Panel -->
    <div class="panel" id="panel-contact"></div>
```

- [ ] **Step 2: Add the About panel div immediately after the Contact one**

```html
    <!-- Pricing Editor Panel -->
    <div class="panel" id="panel-pricing"></div>

    <!-- Contact Editor Panel -->
    <div class="panel" id="panel-contact"></div>

    <!-- About Editor Panel -->
    <div class="panel" id="panel-about"></div>
```

- [ ] **Step 3: Commit**

```bash
git add dawei-admin/index.html
git commit -m "feat: add panel-about div to admin shell"
```

---

## Task 3: Add the About tab button in `renderTabs()`

**Files:**
- Modify: `dawei-admin/index.html` (inside `renderTabs()`, around line 523–528)

- [ ] **Step 1: Find the Contact tab creation block in `renderTabs()`**

Locate this block (around line 523):

```javascript
  // Contact tab
  var contactTab = document.createElement('button');
  contactTab.className = 'tab';
  contactTab.textContent = 'Contact';
  contactTab.dataset.galleryId = 'contact';
  contactTab.onclick = function() { switchTab('contact'); };
  tabBar.appendChild(contactTab);
```

- [ ] **Step 2: Insert the About tab immediately after it**

```javascript
  // Contact tab
  var contactTab = document.createElement('button');
  contactTab.className = 'tab';
  contactTab.textContent = 'Contact';
  contactTab.dataset.galleryId = 'contact';
  contactTab.onclick = function() { switchTab('contact'); };
  tabBar.appendChild(contactTab);

  // About tab
  var aboutTab = document.createElement('button');
  aboutTab.className = 'tab';
  aboutTab.textContent = 'About';
  aboutTab.dataset.galleryId = 'about';
  aboutTab.onclick = function() { switchTab('about'); };
  tabBar.appendChild(aboutTab);
```

- [ ] **Step 3: Call `renderAboutPanel()` at the end of `renderTabs()`**

Find where `renderPricingPanel()` and `renderContactPanel()` are called at the bottom of `renderTabs()` (around line 537):

```javascript
  // Render page editors
  renderPricingPanel();
  renderContactPanel();
```

Change it to:

```javascript
  // Render page editors
  renderPricingPanel();
  renderContactPanel();
  renderAboutPanel();
```

- [ ] **Step 4: Commit**

```bash
git add dawei-admin/index.html
git commit -m "feat: add About tab to admin tab bar"
```

---

## Task 4: Add `renderAboutPanel()` and helper functions to admin JS

**Files:**
- Modify: `dawei-admin/index.html` (add new JS functions after the `renderContactPanel` / `saveContactChanges` / `uploadContactPhoto` block, around line 1614)

- [ ] **Step 1: Add `buildTestimonialCardHTML()` after `uploadContactPhoto()`**

```javascript
// ── About Editor ───────────────────────────────────────────────────────────────
function buildTestimonialCardHTML(t, index, total) {
  var html =
    '<div class="card-editor" data-testimonial-id="' + t.id + '">' +
      '<div class="card-editor-header">' +
        '<input type="text" class="editor-input" id="testimonial-name-' + t.id + '" value="' + escHtml(t.name) + '" placeholder="Client name">' +
        '<div class="card-editor-actions">';
  if (index > 0) {
    html += '<button class="btn btn-sm btn-outline" onclick="moveTestimonialCard(\'' + t.id + '\', -1)" title="Move up">↑</button>';
  }
  if (index < total - 1) {
    html += '<button class="btn btn-sm btn-outline" onclick="moveTestimonialCard(\'' + t.id + '\', 1)" title="Move down">↓</button>';
  }
  html +=
        '<button class="btn btn-sm btn-danger" onclick="removeTestimonialCard(\'' + t.id + '\')">Delete</button>' +
        '</div>' +
      '</div>' +
      '<div class="editor-section" style="margin-bottom:0;">' +
        '<textarea class="editor-textarea" id="testimonial-text-' + t.id + '" rows="4" placeholder="Client quote">' + escHtml(t.text) + '</textarea>' +
      '</div>' +
    '</div>';
  return html;
}
```

- [ ] **Step 2: Add `renderAboutPanel()`**

```javascript
function renderAboutPanel() {
  var panel = document.getElementById('panel-about');
  if (!panel || !config.about) return;
  var about = config.about;
  var html =
    '<div class="toolbar">' +
      '<h2>About Page</h2>' +
      '<span class="save-status" id="status-about"></span>' +
      '<button class="btn btn-sm btn-success" onclick="saveAboutChanges()">Save Changes</button>' +
    '</div>' +
    '<div class="editor-section">' +
      '<label class="editor-label">Bio</label>' +
      '<textarea class="editor-textarea" id="about-bio-input" rows="8">' + escHtml(about.bio || '') + '</textarea>' +
      '<div class="editor-hint">Paragraphs are separated by a blank line (press Enter twice).</div>' +
    '</div>' +
    '<div class="editor-hint" style="margin-bottom:24px;">To change the About photo, go to the <strong>Contact</strong> tab &rarr; Contact Photo.</div>' +
    '<div class="editor-section">' +
      '<label class="editor-label">Testimonials</label>' +
      '<div id="about-testimonials-editor">';
  (about.testimonials || []).forEach(function(t, i) {
    html += buildTestimonialCardHTML(t, i, about.testimonials.length);
  });
  html +=
      '</div>' +
      '<div style="margin-top:16px;">' +
        '<button class="btn btn-sm btn-outline" onclick="addTestimonialCard()">+ Add Testimonial</button>' +
      '</div>' +
    '</div>';
  panel.innerHTML = html;
}
```

- [ ] **Step 3: Add `readAboutFromDOM()`**

```javascript
function readAboutFromDOM() {
  if (!config.about) return;
  var bioInput = document.getElementById('about-bio-input');
  if (bioInput) config.about.bio = bioInput.value;
  var cards = document.querySelectorAll('#about-testimonials-editor .card-editor');
  config.about.testimonials = Array.from(cards).map(function(card) {
    var id = card.dataset.testimonialId;
    var nameEl = document.getElementById('testimonial-name-' + id);
    var textEl = document.getElementById('testimonial-text-' + id);
    return {
      id: id,
      name: nameEl ? nameEl.value.trim() : '',
      text: textEl ? textEl.value.trim() : ''
    };
  });
}
```

- [ ] **Step 4: Add `saveAboutChanges()`**

```javascript
async function saveAboutChanges() {
  readAboutFromDOM();
  setStatus('about', 'saving');
  var ok = await saveConfig();
  setStatus('about', ok ? 'saved' : 'error');
  if (ok) toast('About page updated!');
}
```

- [ ] **Step 5: Add `addTestimonialCard()`**

```javascript
function addTestimonialCard() {
  readAboutFromDOM();
  var newT = {
    id: 't-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    name: '',
    text: ''
  };
  if (!config.about.testimonials) config.about.testimonials = [];
  config.about.testimonials.push(newT);
  renderAboutPanel();
  var nameInput = document.getElementById('testimonial-name-' + newT.id);
  if (nameInput) nameInput.focus();
}
```

- [ ] **Step 6: Add `removeTestimonialCard()`**

```javascript
function removeTestimonialCard(id) {
  readAboutFromDOM();
  var t = config.about.testimonials.find(function(t) { return t.id === id; });
  var name = t ? (t.name || 'this testimonial') : 'this testimonial';
  confirmAction = function() {
    config.about.testimonials = config.about.testimonials.filter(function(t) { return t.id !== id; });
    renderAboutPanel();
  };
  document.getElementById('confirmTitle').textContent = 'Delete testimonial?';
  document.getElementById(‘confirmDesc’).textContent = ‘Remove "’ + name + ‘" testimonial? Remember to click Save Changes.’;
  document.getElementById('confirmModal').classList.add('open');
}
```

- [ ] **Step 7: Add `moveTestimonialCard()`**

```javascript
function moveTestimonialCard(id, direction) {
  readAboutFromDOM();
  var testimonials = config.about.testimonials;
  var idx = testimonials.findIndex(function(t) { return t.id === id; });
  if (idx < 0) return;
  var newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= testimonials.length) return;
  var temp = testimonials[idx];
  testimonials[idx] = testimonials[newIdx];
  testimonials[newIdx] = temp;
  renderAboutPanel();
}
```

- [ ] **Step 8: Commit**

```bash
git add dawei-admin/index.html
git commit -m "feat: add About admin panel with bio and testimonials editor"
```

---

## Task 5: Make the public About section dynamic in `index.html`

**Files:**
- Modify: `index.html` (lines 275–280 bio paragraphs; lines 289–322 testimonial cards; JS around line 668)

- [ ] **Step 1: Empty the hardcoded bio content and add an id**

Find this block in `index.html` (around line 275):

```html
      <div class="about-bio">
        <p>The best family photos don't look like photo sessions. They look like a real day out where everyone was actually having fun and someone happened to be there with a camera.</p>
        <p>With 15 years of shooting kids and families across Westchester's parks and trails, knowing these locations as well as I do means planning every shoot around the best light, getting the most out of wherever we are, and being ready for the moment right before someone laughs or a kid forgets there's even a camera. A lot of the families I shoot keep coming back, and there's nothing quite like watching the kids grow up through photos.</p>
        <p>Backyard sessions are also an option for families who prefer shooting close to home. There's something about a familiar space that makes kids more comfortable, and that comfort shows up in the photos.</p>
        <p>I don't rush, I don't force poses, and I give kids time to warm up to me before I start shooting. Parents are usually surprised by how relaxed the whole thing feels, and how different the photos look because of it.</p>
        <p>I typically work with kids 5 and up, and if you've been putting off booking because you're convinced your kids won't cooperate, that's exactly the kind of session I'm used to.</p>
      </div>
```

Replace with:

```html
      <div class="about-bio" id="aboutBio"></div>
```

- [ ] **Step 2: Empty the hardcoded testimonials and add an id**

Find the testimonials grid opening tag (around line 289):

```html
    <div class="testimonials-grid">
      <div class="testimonial-card">
        ...8 hardcoded testimonial cards...
      </div>
    </div>
```

Replace the entire `<div class="testimonials-grid">...</div>` block with:

```html
    <div class="testimonials-grid" id="testimonialsGrid"></div>
```

- [ ] **Step 3: Add `renderAbout()` in the JS section**

Find `renderContact(config)` function in `index.html` (around line 668). Immediately **after** the closing `}` of `renderContact`, add:

```javascript
function renderAbout(config) {
  var bioEl = document.getElementById('aboutBio');
  var gridEl = document.getElementById('testimonialsGrid');
  if (!config || !config.about) return;

  if (bioEl && config.about.bio) {
    var paragraphs = config.about.bio.split(/\n\n+/);
    bioEl.innerHTML = paragraphs
      .map(function(p) { return '<p>' + escHtml(p.trim()) + '</p>'; })
      .join('');
  }

  if (gridEl && config.about.testimonials) {
    gridEl.innerHTML = config.about.testimonials.map(function(t) {
      return '<div class="testimonial-card">' +
        '<p class="testimonial-text">' + escHtml(t.text) + '</p>' +
        '<p class="testimonial-name">' + escHtml(t.name) + '</p>' +
      '</div>';
    }).join('');
  }
}
```

- [ ] **Step 4: Call `renderAbout()` from `init()`**

Find the `init()` call block (around line 695):

```javascript
  var config = await fetchConfig();
  buildGalleries(config);
  renderPricing(config);
  renderContact(config);
```

Change to:

```javascript
  var config = await fetchConfig();
  buildGalleries(config);
  renderPricing(config);
  renderContact(config);
  renderAbout(config);
```

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: render About section dynamically from gallery-config"
```

---

## Task 6: End-to-end verification

- [ ] **Step 1: Open the public site locally (or on Netlify after push)**

Navigate to the About section. Confirm:
- The bio renders as 5 paragraphs (not blank, not raw text)
- All 8 testimonials appear in the grid
- No JS errors in the browser console

- [ ] **Step 2: Open the admin and navigate to the About tab**

- Confirm the tab appears between "Contact" and "Private Galleries"
- Confirm the bio textarea is pre-filled with the 5-paragraph text
- Confirm all 8 testimonial cards render with name inputs and quote textareas

- [ ] **Step 3: Test editing the bio**

- Clear one word in the bio textarea and type a replacement
- Click "Save Changes"
- Confirm the toast shows "About page updated!"
- Reload the public site and confirm the change is visible in the About section

- [ ] **Step 4: Test adding a testimonial**

- Click "+ Add Testimonial"
- Fill in a name and quote
- Click "Save Changes"
- Reload the public site — confirm the new testimonial appears

- [ ] **Step 5: Test reordering testimonials**

- Click the ↓ arrow on the first testimonial card
- Confirm it swaps position with the second card
- Click "Save Changes"
- Reload the public site — confirm the new order is reflected

- [ ] **Step 6: Test deleting a testimonial**

- Click "Delete" on any card
- Confirm the confirm modal appears
- Click "Delete" in the modal
- Confirm the card is removed from the list
- Click "Save Changes"
- Reload the public site — confirm the testimonial is gone

- [ ] **Step 7: Final commit if any fixes were made during verification**

```bash
git add -p
git commit -m "fix: address issues found during About editor verification"
```

---

## Post-Implementation

Once all tasks pass, push to trigger Netlify deployment:

```bash
git push
```

This deploys both the About admin editor and the dynamic About section on the public site simultaneously.
