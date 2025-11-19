// Switch theme 
(function() {
  var btn = document.getElementById('theme-toggle');
  var saved = localStorage.getItem('theme');
  if (saved === 'dark') document.body.classList.add('theme-dark');

  if (btn) {
    btn.addEventListener('click', function() {
      document.body.classList.toggle('theme-dark');
      var isDark = document.body.classList.contains('theme-dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }
})();




// =====================
//  Global Popup Helpers
// =====================
function getPopupElements() {
  var overlay = document.getElementById('popupOverlay');
  if (!overlay) return null;

  return {
    overlay: overlay,
    titleEl: document.getElementById('popupTitle'),
    msgEl: document.getElementById('popupMessage'),
    okBtn: document.getElementById('popupOk'),
    cancelBtn: document.getElementById('popupCancel')
  };
}

function showPopup(message, options) {
  options = options || {};
  var els = getPopupElements();
  if (!els) {

    alert(message);
    if (typeof options.onClose === 'function') {
      options.onClose();
    }
    return;
  }

  var title = options.title || 'Alert';
  var onClose = options.onClose || null;

  if (els.titleEl) els.titleEl.textContent = title;
  if (els.msgEl) els.msgEl.textContent = message;

  els.overlay.style.display = 'flex';
  els.overlay.setAttribute('aria-hidden', 'false');


  if (els.cancelBtn) {
    els.cancelBtn.style.display = 'none';
  }

 
  var newOk = els.okBtn.cloneNode(true);
  els.okBtn.parentNode.replaceChild(newOk, els.okBtn);
  els.okBtn = newOk;

  els.okBtn.addEventListener('click', function () {
    els.overlay.style.display = 'none';
    els.overlay.setAttribute('aria-hidden', 'true');
    if (typeof onClose === 'function') onClose();
  });
}

// Confirm  popup (OK + Cancel)
function showConfirm(message, options) {
  options = options || {};
  var els = getPopupElements();
  if (!els) {

    var ok = confirm(message);
    if (ok && typeof options.onConfirm === 'function') options.onConfirm();
    if (!ok && typeof options.onCancel === 'function') options.onCancel();
    return;
  }

  var title = options.title || 'Confirm';
  var onConfirm = options.onConfirm || null;
  var onCancel = options.onCancel || null;

  if (els.titleEl) els.titleEl.textContent = title;
  if (els.msgEl) els.msgEl.textContent = message;

  els.overlay.style.display = 'flex';
  els.overlay.setAttribute('aria-hidden', 'false');

  if (els.cancelBtn) {
    els.cancelBtn.style.display = 'inline-block';
  }


  var newOk = els.okBtn.cloneNode(true);
  var newCancel = els.cancelBtn.cloneNode(true);
  els.okBtn.parentNode.replaceChild(newOk, els.okBtn);
  els.cancelBtn.parentNode.replaceChild(newCancel, els.cancelBtn);
  els.okBtn = newOk;
  els.cancelBtn = newCancel;

  function close() {
    els.overlay.style.display = 'none';
    els.overlay.setAttribute('aria-hidden', 'true');
  }

  els.okBtn.addEventListener('click', function () {
    close();
    if (typeof onConfirm === 'function') onConfirm();
  });

  els.cancelBtn.addEventListener('click', function () {
    close();
    if (typeof onCancel === 'function') onCancel();
  });
}




//*******************Start of leen******************************
//**************************************************************

// Add service page
(function () {
  var form = document.getElementById('addServiceForm');
  if (!form) return;

  var nameEl  = document.getElementById('leen-sv-name');
  var priceEl = document.getElementById('leen-sv-price');
  var descEl  = document.getElementById('leen-sv-desc');
  var photoEl = document.getElementById('leen-sv-photo');

  form.addEventListener('input', function(e) {
    if (e.target && e.target.classList) {
      e.target.classList.remove('is-invalid');}
  });

  function markInvalid(element) {
    if (element && element.classList) {
      element.classList.add('is-invalid');
      try { element.focus(); } catch (err) {}
      try { element.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (err) {}
    }
  }

  function showMessageAndFocus(text, element) {
    showPopup(text, { title: 'Validation Error' });
    if (element) markInvalid(element);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var catChecked = form.querySelector('input[name="category"]:checked');

    var name = nameEl ? nameEl.value.trim() : '';
    var price = priceEl ? priceEl.value.trim() : '';
    var desc = descEl ? descEl.value.trim() : '';

    if (!name) {
      showMessageAndFocus('Name is required.', nameEl);
      return;
    }
    if (/^\d/.test(name)) {
      showMessageAndFocus('Name can not start with a number.', nameEl);
      return;
    }
    if (!price) {
      showMessageAndFocus('Price is required.', priceEl);
      return;
    }
    var priceValue = Number(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      showMessageAndFocus('Price must be a positive number.', priceEl);
      return;
    }
    if (!catChecked) {
      var firstRadio = form.querySelector('input[name="category"]');
      showMessageAndFocus('Category is required. Please choose Experience or Hospitality.', firstRadio || form);
      return;
    }
    if (!desc) {
      showMessageAndFocus('Description is required.', descEl);
      return;
    }
    if (!photoEl || photoEl.files.length === 0) {
      showMessageAndFocus('Photo is required.', photoEl);
      return;
    }

    var reader = new FileReader();
    reader.onload = function (ev) {
      var all = JSON.parse(localStorage.getItem('services') || '[]');

      //(case-insensitive)
      var duplicate = all.some(function(s) {
        return s.name && s.name.toLowerCase() === name.toLowerCase();
      });
      if (duplicate) {
        showMessageAndFocus('A service with this name already exists.', nameEl);
        return;
      }

      var newService = {
        name: name,
        price: priceValue,
        category: catChecked.value,
        desc: desc,
        photo: ev.target.result
      };

      all.push(newService);
      localStorage.setItem('services', JSON.stringify(all));

      showPopup('Service ' + name + ' has been added successfully.', {
        title: 'Success'
      });

      form.reset();

      var event = new Event('servicesUpdated');
      window.dispatchEvent(event);
    };

    reader.readAsDataURL(photoEl.files[0]);
  });
})();




// Pavilion page load and delete
(function () {
  var expList = document.getElementById('experiencesList');
  var hosList = document.getElementById('hospitalityList');
  var clearBtn = document.getElementById('clearServices');

  if (!expList || !hosList) return;

  function render() {
    var data = JSON.parse(localStorage.getItem('services') || '[]');
    expList.innerHTML = '';
    hosList.innerHTML = '';

    var exp = data.filter(function(s){ return s.category === 'experience'; });
    var hos = data.filter(function(s){ return s.category === 'hospitality'; });

    if (exp.length === 0) {
      expList.innerHTML = '<p class="empty-note">No Experience available.</p>';
    } else {
      exp.forEach(function(s){
        var html = '<div class="leen-item">';
        html += '<img src="' + s.photo + '" class="leen-thumb" alt="' + escapeHtml(s.name) + '">';
        html += '<h4 class="leen-name">' + escapeHtml(s.name) + '</h4>';
        html += '<p>' + escapeHtml(s.desc) + '</p>';
        html += '<p><strong>Price:</strong> ' + escapeHtml(String(s.price)) + ' SAR</p>';
        html += '</div>';
        expList.insertAdjacentHTML('beforeend', html);
      });
    }

    if (hos.length === 0) {
      hosList.innerHTML = '<p class="empty-note">No Hospitality Available.</p>';
    } else {
      hos.forEach(function(s){
        var html = '<div class="leen-item">';
        html += '<img src="' + s.photo + '" class="leen-thumb" alt="' + escapeHtml(s.name) + '">';
        html += '<h4 class="leen-name">' + escapeHtml(s.name) + '</h4>';
        html += '<p>' + escapeHtml(s.desc) + '</p>';
        html += '<p><strong>Price:</strong> ' + escapeHtml(String(s.price)) + ' SAR</p>';
        html += '</div>';
        hosList.insertAdjacentHTML('beforeend', html);
      });
    }

  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escapeAttr(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  render();

  if (clearBtn) {
    clearBtn.addEventListener('click', function(){
      showConfirm('Are you sure you want to delete all services?', {
        title: 'Confirm Delete',
        onConfirm: function () {
          localStorage.removeItem('services');
          render();
        }
      });
    });
  }

  window.addEventListener('servicesUpdated', function(){ render(); });
})();


// RENDER & DELETE ON EXPO TEAM PAGE
(function(){
  var grid = document.getElementById('teamGrid');
  var delBtn = document.getElementById('deleteMembers');
  if(!grid) return;

  var LS_KEY = 'teamMembers';

  function getMembers(){
    var raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  }
  function setMembers(arr){
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
  }

  function seedFromDOM(){
    var items = Array.from(document.querySelectorAll('.leen-team-box'));
    if(!items.length) return;
    var seeded = items.map(function(box, i){
      var nameEl = box.querySelector('.leen-member-name');
      var imgEl  = box.querySelector('img');
      return {
        id: Date.now()+i,
        name: nameEl ? nameEl.textContent.trim() : ('Member '+(i+1)),
        image: imgEl ? imgEl.getAttribute('src') : ''
      };
    });
    setMembers(seeded);
  }

  if(!localStorage.getItem(LS_KEY)) seedFromDOM();

  function render(){
    var data = getMembers();
    grid.innerHTML = '';
    if(data.length === 0){
      grid.innerHTML = '<p class="empty-note">No team members yet.</p>';
      return;
    }
    var html = data.map(function(m){
      return (
        '<label class="leen-team-box">'+
          '<input type="checkbox" class="member-check" value="'+m.id+'">'+
          '<img src="'+m.image+'" alt="'+m.name+'">'+
          '<span class="leen-member-name">'+m.name+'</span>'+
        '</label>'
      );
    }).join('');
    grid.insertAdjacentHTML('beforeend', html);
  }

  render();

  if(delBtn){
    delBtn.addEventListener('click', function(){
      var checks = Array.from(document.querySelectorAll('.member-check:checked'));
      if(checks.length === 0){
        showPopup('Please select at least one member.', {
          title: 'Notice'
        });
        return;
      }

      showConfirm('Are you sure you want to delete the selected members?', {
        title: 'Confirm Delete',
        onConfirm: function () {
          var idsToDelete = checks.map(function(c){ return c.value; });
          var all = getMembers();
          var kept = all.filter(function(m){ return idsToDelete.indexOf(String(m.id)) === -1; });
          setMembers(kept);
          render();
          showPopup('Selected members have been deleted.', {
            title: 'Success'
          });
        }
      });
    });
  }
})();

// VALIDATE & SAVE (ADD-MEMBER PAGE)
(function(){
  var form = document.getElementById('addMemberForm');
  if(!form) return;

  var LS_KEY = 'teamMembers';

  function getMembers(){
    var raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  }
  function setMembers(arr){
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
  }

  function firstCheckedValue(name){
    var el = form.querySelector('input[name="'+name+'"]:checked');
    return el ? el.value : '';
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();

    var name  = (document.getElementById('leen-name').value || '').trim();
    var gender = firstCheckedValue('gender')|| form.querySelector('#leen-gender')?.value || '';

    var dob   = (document.getElementById('leen-dob').value || '').trim();
    var email = (document.getElementById('leen-email').value || '').trim();
    var edu   = (document.getElementById('leen-edu').value || '').trim();
    var skills= (document.getElementById('leen-skills').value || '').trim();
    var exp   = (document.getElementById('leen-exp').value || '').trim();
    var photo = document.getElementById('leen-photo');

    if(!name){
      showPopup('Name is required.', { title: 'Validation Error' });
      return;
    }
    if(/^\d/.test(name)){
      showPopup('Name can not start with a number.', { title: 'Validation Error' });
      return;
    }
    if(!gender){
      showPopup('Please select gender.', { title: 'Validation Error' });
      return;
    }
    if(!dob){
      showPopup('Date of birth is required.', { title: 'Validation Error' });
      return;
    }
    if (!email) {
      showPopup('Email is required.', { title: 'Validation Error' });
      return;
    }

    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      showPopup('Please enter a valid email address (e.g. name@example.com).', {
        title: 'Validation Error'
      });
      return;
    }
    if(!edu){
      showPopup('Education is required.', { title: 'Validation Error' });
      return;
    }
    if(!skills){
      showPopup('Skills are required.', { title: 'Validation Error' });
      return;
    }
    if(!exp){
      showPopup('Area of expertise is required.', { title: 'Validation Error' });
      return;
    }
    if(!photo.files.length){
      showPopup('Photo is required.', { title: 'Validation Error' });
      return;
    }

    var all = getMembers();
    var duplicate = all.some(function(m){ return m.name.toLowerCase() === name.toLowerCase(); });
    if(duplicate){
      showPopup('A member with this name already exists.', { title: 'Validation Error' });
      return;
    }

    var reader = new FileReader();
    reader.onload = function(ev){
      var member = {
        id: Date.now(),
        name: name,
        gender: gender,
        dob: dob,
        email: email,
        education: edu,
        skills: skills,
        expertise: exp,
        image: ev.target.result
      };
      all.push(member);
      setMembers(all);
      showPopup('Member "'+name+'" has been added successfully.', {
        title: 'Success'
      });
      form.reset();
    };
    reader.readAsDataURL(photo.files[0]);
  });
})();


//*******************End of leen******************************
//**************************************************************





//******************* Start Of Alanoud******************************
//**************************************************************


class AlanoudCountdown {
  constructor(selector, targetDate) {
    this.el = document.querySelector(selector);
    if (!this.el) return;


    this.target = new Date(targetDate);
    this.start();
  }


  pad(num) {
    return num < 10 ? "0" + num : num;
  }


  update() {
    const now = new Date();
    let diff = this.target - now;


    if (diff <= 0) {
      this.el.innerHTML =
        `00d : 00h : 00m : 00s`;
      clearInterval(this.timer);
      return;
    }


    const totalSec = Math.floor(diff / 1000);
    const days  = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins  = Math.floor((totalSec % 3600) / 60);
    const secs  = totalSec % 60;


    this.el.innerHTML = `
      <span class="alanoud-num">${this.pad(days)}</span>d :
      <span class="alanoud-num">${this.pad(hours)}</span>h :
      <span class="alanoud-num">${this.pad(mins)}</span>m :
      <span class="alanoud-num">${this.pad(secs)}</span>s
    `;
  }


  start() {
    this.update();
    this.timer = setInterval(() => this.update(), 1000);
  }
}






document.addEventListener("DOMContentLoaded", () => {
  new AlanoudCountdown(
    ".alanoud-countdown",
    "2025-12-03T00:00:00+03:00"  
  );
});




// === HOMEPAGE JS: Back-to-Top + Live Clock  ===
(function () {
 
  if (window.__expoHomeJS) return;
  window.__expoHomeJS = true;


  // 1) Back to Top
  const toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.textContent = '↑';
  Object.assign(toTop.style, {
    position: 'fixed',
    right: '18px',
    bottom: '18px',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: '1px solid #b0893f',
    boxShadow: '0 4px 10px rgba(0,0,0,.18)',
    background: '#E2B45E',
    color: '#3A2A00',
    fontWeight: '800',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'none',
    zIndex: '9999',
    transition: 'transform .15s ease, opacity .15s ease'
  });
  toTop.addEventListener('mouseenter', () => (toTop.style.transform = 'translateY(-2px)'));
  toTop.addEventListener('mouseleave', () => (toTop.style.transform = 'translateY(0)'));
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(toTop);


  const toggleBtn = () => {
    if (window.scrollY > 300) {
      toTop.style.display = 'block';
      toTop.style.opacity = '1';
    } else {
      toTop.style.opacity = '0';
      toTop.style.display = 'none';
    }
  };
  window.addEventListener('scroll', toggleBtn, { passive: true });
  toggleBtn();


  // 2) Live Clock
  const footerBottom = document.querySelector('.main-footer .footer-bottom');
  if (footerBottom) {
   
    const clockWrap = document.createElement('span');
    clockWrap.id = 'live-clock';
    clockWrap.style.marginLeft = '10px';
    clockWrap.style.fontWeight = '700';


   
    const sep = document.createElement('span');
    sep.textContent = ' | ';
    footerBottom.appendChild(sep);
    footerBottom.appendChild(clockWrap);


   
    const opts = {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false, timeZone: 'Asia/Riyadh'
    };


    const tick = () => {
      try {
        clockWrap.textContent = new Date().toLocaleTimeString('en-GB', opts);
      } catch {
       
        clockWrap.textContent = new Date().toLocaleTimeString();
      }
    };
    tick();
    setInterval(tick, 1000);
  }
})();




//******************* End Of Alanoud******************************
//**************************************************************








//******************* Start Of Dala******************************
//**************************************************************




document.addEventListener("DOMContentLoaded", function () {



  const form = document.querySelector(".rating-formDalal");
  if (!form) return;


  const select    = document.getElementById("requestToRate");
  const comment   = document.getElementById("comment");
  const ratingInp = document.getElementById("ratingValueDalal");
  const stars     = document.querySelectorAll(".starDalal");



  function showPopup(title, message, callback) {
    const popup      = document.getElementById("customPopup");
    const titleEl    = document.getElementById("popupTitle");
    const messageEl  = document.getElementById("popupMessage");
    const buttonEl   = document.getElementById("popupBtn");


    if (!popup || !titleEl || !messageEl || !buttonEl) {

      alert(message);
      if (callback) callback();
      return;
    }


    titleEl.textContent   = title;
    messageEl.textContent = message;


    popup.style.display = "flex";


    buttonEl.onclick = function () {
      popup.style.display = "none";
      if (callback) callback();
    };
  }


  stars.forEach(star => {
    star.addEventListener("click", function () {
      const rating = parseInt(this.dataset.rating);


      ratingInp.value = rating;


      stars.forEach(s => {
        const r = parseInt(s.dataset.rating);
        if (r <= rating) {
          s.classList.remove("fa-regular");
          s.classList.add("fa-solid");
        } else {
          s.classList.remove("fa-solid");
          s.classList.add("fa-regular");
        }
      });


      stars.forEach(s => s.classList.remove("star-error"));
    });
  });


  form.addEventListener("submit", function (e) {
    e.preventDefault(); 



    select.classList.remove("input-error");
    comment.classList.remove("input-error");
    stars.forEach(s => s.classList.remove("star-error"));


    let valid = true;



    if (!select.value) {
      valid = false;
      select.classList.add("input-error");
    }



    if (ratingInp.value === "0") {
      valid = false;
      stars.forEach(s => s.classList.add("star-error"));
    }



    if (comment.value.trim() === "") {
      valid = false;
      comment.classList.add("input-error");
    }



    if (!valid) {
      showPopup(
        "Missing Information",
        "Please select an experience, add a rating, and write your feedback before submitting.",
        null
      );
      return;
    }



    const rating = parseInt(ratingInp.value);


    if (rating === 1) {

      showPopup(
        "We're Sorry",
        "Your experience wasn’t satisfying. We truly appreciate your feedback and will work to improve.",
        () => { window.location.href = "explorer.html"; }
      );
    } else if (rating >= 2) {

      showPopup(
        "Thank You!",
        "We’re happy that you had a positive experience. Thank you for your rating!",
        () => { window.location.href = "explorer.html"; }
      );
    }
  });
});
document.addEventListener("DOMContentLoaded", function () {


  // ==========================
  // Missing Item Form Handling
  // ==========================


  const form = document.querySelector(".missing-item-formDalal");
  if (!form) return; 


  const fullName = document.getElementById("fullNameDalal");
  const phone    = document.getElementById("phoneNumberDalal");
  const date     = document.getElementById("dateLostDalal");
  const desc     = document.getElementById("descriptionDalal");
  const image    = document.getElementById("itemImage");


  phone.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "");
  });


  form.addEventListener("submit", function (e) {
    e.preventDefault();


    let valid = true;

    [fullName, phone, date, desc].forEach(input =>
      input.classList.remove("input-error")
    );


    if (fullName.value.trim() === "") {
      fullName.classList.add("input-error");
      valid = false;
    }



    if (phone.value.trim() === "" || !/^\d+$/.test(phone.value)) {
      phone.classList.add("input-error");
      valid = false;
    }



    if (date.value === "") {
      date.classList.add("input-error");
      valid = false;
    }



    if (desc.value.trim() === "") {
      desc.classList.add("input-error");
      valid = false;
    }



    if (image.files.length === 0) {
      valid = false;
      showMissingPopup(
        "Missing Photo",
        "Please upload a photo of the missing item."
      );
      return;
    }



    if (!valid) {
      showMissingPopup(
        "Incomplete Form",
        "Please fill all required fields before submitting."
      );
      return;
    }


   
    showMissingPopup(
      "Success!",
      "Your missing item report has been submitted successfully.",
      function () {

        window.location.href = "explorer.html";
      }
    );
  });


  // ==========================
  // Popup missing item
  // ==========================
  function showMissingPopup(title, message, onClose) {
   
    const popup = document.createElement("div");
    popup.className = "popup-overlay";
    popup.style.display = "flex";


    popup.innerHTML = `
      <div class="popup-box">
        <h2>${title}</h2>
        <p>${message}</p>
        <button class="popup-button">OK</button>
      </div>
    `;


    document.body.appendChild(popup);


    const btn = popup.querySelector(".popup-button");
    btn.addEventListener("click", function () {
      popup.remove();
      if (onClose) onClose();
    });
  }


});


//******************* End of dalal******************************
//**************************************************************










