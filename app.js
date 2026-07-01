// Supabase Client Config
const supabaseUrl = 'https://cgxgvvtrvxnamdylluax.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNneGd2dnRydnhuYW1keWxsdWF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NjAwNDQsImV4cCI6MjA5ODQzNjA0NH0.7pZarplo4eYu_HbTbrl2yUhNCovozeERyqJ6us-m9kY';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const signupForm = document.getElementById('signupForm');
  const btnSubmit = document.getElementById('btnSubmit');
  
  const fields = {
    username: {
      input: document.getElementById('username'),
      group: document.getElementById('group-username'),
      msg: document.getElementById('msg-username'),
      validate: validateUsername
    },
    password: {
      input: document.getElementById('password'),
      group: document.getElementById('group-password'),
      msg: document.getElementById('msg-password'),
      validate: validatePassword
    },
    confirm_password: {
      input: document.getElementById('confirm_password'),
      group: document.getElementById('group-confirm_password'),
      msg: document.getElementById('msg-confirm_password'),
      validate: validateConfirmPassword
    },
    email: {
      input: document.getElementById('email'),
      group: document.getElementById('group-email'),
      msg: document.getElementById('msg-email'),
      validate: validateEmail
    },
    phone: {
      input: document.getElementById('phone'),
      group: document.getElementById('group-phone'),
      msg: document.getElementById('msg-phone'),
      validate: validatePhone
    },
    terms: {
      input: document.getElementById('termsAgree'),
      group: document.querySelector('.form-terms'),
      msg: document.getElementById('msg-terms'),
      validate: validateTerms
    }
  };

  // Password Visibility Toggle Elements
  const btnTogglePassword = document.querySelector('.btn-toggle-password');
  const strengthBar = document.getElementById('strengthBar');
  const strengthText = document.getElementById('strengthText');

  // Success Modal Elements
  const successModal = document.getElementById('successModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const modalData = {
    id: document.getElementById('result-id'),
    username: document.getElementById('result-username'),
    password: document.getElementById('result-password'),
    email: document.getElementById('result-email'),
    phone: document.getElementById('result-phone'),
    date: document.getElementById('result-date')
  };

  // --- Realtime Event Listeners ---
  
  // 1. Text Inputs validation on input and blur
  Object.keys(fields).forEach(key => {
    const field = fields[key];
    
    // Validate on typing (input) or checkbox change
    field.input.addEventListener('input', () => {
      field.validate(false); // Validate gently (don't show errors on initial typing if they are typing, but clean success/error classes dynamically)
    });

    // Validate strictly on losing focus (blur)
    field.input.addEventListener('blur', () => {
      field.validate(true); // Show errors strictly when focus is lost
    });
  });

  // 2. Auto-format Phone Number (add hyphens dynamically)
  fields.phone.input.addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^\d]/g, ''); // Extract numbers only
    
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    
    // Format: 010-XXXX-XXXX or 010-XXX-XXXX
    let formatted = '';
    if (value.length <= 3) {
      formatted = value;
    } else if (value.length <= 7) {
      formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else {
      formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
    }
    
    e.target.value = formatted;
  });

  // 3. Password Visibility Toggle
  btnTogglePassword.addEventListener('click', () => {
    const type = fields.password.input.getAttribute('type') === 'password' ? 'text' : 'password';
    fields.password.input.setAttribute('type', type);
    
    // Toggle Eye Icon
    const icon = btnTogglePassword.querySelector('i');
    if (type === 'text') {
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
      btnTogglePassword.setAttribute('aria-label', '비밀번호 숨기기');
    } else {
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
      btnTogglePassword.setAttribute('aria-label', '비밀번호 보기');
    }
  });

  // 4. Password Strength Meter Update on Input
  fields.password.input.addEventListener('input', () => {
    updatePasswordStrength(fields.password.input.value);
    
    // If confirm password has value, re-validate it as password changes
    if (fields.confirm_password.input.value) {
      fields.confirm_password.validate(false);
    }
  });


  // --- Validation Helper Functions ---

  // Helper to set UI State
  function setFieldState(field, isValid, errorMsg = '') {
    if (isValid) {
      field.group.classList.remove('error');
      field.group.classList.add('success');
      field.msg.style.display = 'none';
    } else {
      field.group.classList.remove('success');
      field.group.classList.add('error');
      field.msg.innerText = errorMsg;
      field.msg.style.display = 'block';
    }
  }

  // Helper to clear UI State
  function clearFieldState(field) {
    field.group.classList.remove('success', 'error');
    field.msg.style.display = 'none';
  }

  // 1. Username Validation
  function validateUsername(showError = true) {
    const val = fields.username.input.value.trim();
    if (!val) {
      if (showError) setFieldState(fields.username, false, '아이디를 입력해 주세요.');
      return false;
    }
    
    // Regex: Alphanumeric lowercase, 4 to 20 chars
    const regex = /^[a-z0-9]{4,20}$/;
    if (!regex.test(val)) {
      if (showError) setFieldState(fields.username, false, '아이디는 4~20자의 영문 소문자 및 숫자만 조합 가능합니다.');
      return false;
    }
    
    setFieldState(fields.username, true);
    return true;
  }

  // 2. Password Validation
  function validatePassword(showError = true) {
    const val = fields.password.input.value;
    if (!val) {
      if (showError) setFieldState(fields.password, false, '비밀번호를 입력해 주세요.');
      return false;
    }
    
    // Regex: 영문, 숫자, 특수문자 조합 8~16자
    // 최소 1개 영문자, 1개 숫자, 1개 특수문자 포함
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,16}$/;
    if (!regex.test(val)) {
      if (showError) setFieldState(fields.password, false, '비밀번호는 8~16자의 영문, 숫자, 특수문자(@$!%*#?&)를 모두 포함해야 합니다.');
      return false;
    }
    
    setFieldState(fields.password, true);
    return true;
  }

  // 3. Confirm Password Validation
  function validateConfirmPassword(showError = true) {
    const val = fields.confirm_password.input.value;
    const pwdVal = fields.password.input.value;
    
    if (!val) {
      if (showError) setFieldState(fields.confirm_password, false, '비밀번호 확인을 입력해 주세요.');
      return false;
    }
    
    if (val !== pwdVal) {
      if (showError) setFieldState(fields.confirm_password, false, '비밀번호가 일치하지 않습니다.');
      return false;
    }
    
    setFieldState(fields.confirm_password, true);
    return true;
  }

  // 4. Email Validation
  function validateEmail(showError = true) {
    const val = fields.email.input.value.trim();
    if (!val) {
      if (showError) setFieldState(fields.email, false, '이메일 주소를 입력해 주세요.');
      return false;
    }
    
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(val)) {
      if (showError) setFieldState(fields.email, false, '올바른 이메일 형식(예: student@yju.ac.kr)이 아닙니다.');
      return false;
    }
    
    setFieldState(fields.email, true);
    return true;
  }

  // 5. Phone Validation
  function validatePhone(showError = true) {
    const val = fields.phone.input.value.trim();
    if (!val) {
      if (showError) setFieldState(fields.phone, false, '휴대전화번호를 입력해 주세요.');
      return false;
    }
    
    // Regex: 010-XXXX-XXXX or 010-XXX-XXXX format
    const regex = /^010-\d{3,4}-\d{4}$/;
    if (!regex.test(val)) {
      if (showError) setFieldState(fields.phone, false, '올바른 휴대전화번호 형식(010-XXXX-XXXX)이 아닙니다.');
      return false;
    }
    
    setFieldState(fields.phone, true);
    return true;
  }

  // 6. Terms Validation
  function validateTerms(showError = true) {
    const isChecked = fields.terms.input.checked;
    if (!isChecked) {
      if (showError) {
        fields.terms.group.classList.add('error');
        fields.terms.msg.style.display = 'block';
      }
      return false;
    }
    
    fields.terms.group.classList.remove('error');
    fields.terms.msg.style.display = 'none';
    return true;
  }

  // Password Strength Estimator logic
  function updatePasswordStrength(password) {
    // Reset strength bar if empty
    if (!password) {
      strengthBar.className = 'strength-bar-gauge';
      strengthText.innerText = '보안성 검사 대기';
      return;
    }

    let score = 0;
    
    // Score based on character types
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[@$!%*#?&]/.test(password)) score++;
    if (password.length >= 10) score++;

    // Translate score to styling
    strengthBar.className = 'strength-bar-gauge';
    
    if (password.length < 8) {
      strengthBar.classList.add('strength-weak');
      strengthText.innerText = '너무 짧음 (최소 8자)';
      strengthText.style.color = 'var(--error-color)';
    } else if (score <= 2) {
      strengthBar.classList.add('strength-weak');
      strengthText.innerText = '위험 (단순함)';
      strengthText.style.color = 'var(--error-color)';
    } else if (score === 3 || score === 4) {
      strengthBar.classList.add('strength-medium');
      strengthText.innerText = '보통 (권장)';
      strengthText.style.color = 'var(--accent-color)';
    } else {
      strengthBar.classList.add('strength-strong');
      strengthText.innerText = '안전함';
      strengthText.style.color = 'var(--success-color)';
    }
  }


  // --- Form Submission / DB Simulation ---

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate all fields strictly (showError = true)
    let isAllValid = true;
    Object.keys(fields).forEach(key => {
      const isValid = fields[key].validate(true);
      if (!isValid) {
        isAllValid = false;
      }
    });

    if (!isAllValid) {
      // Find first invalid group and focus its input
      const firstInvalid = Object.values(fields).find(f => {
        // Terms checkbox is a different input type, but we can check if it's invalid
        if (f.input === fields.terms.input) {
          return !f.input.checked;
        }
        // for inputs, look at validity
        return !f.validate(false);
      });
      
      if (firstInvalid && firstInvalid.input) {
        firstInvalid.input.focus();
      }
      return;
    }

    // Process Mock Signup (Database Save Simulation)
    btnSubmit.disabled = true;
    const originalText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = `<span>가입 중...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;

    try {
      // Simulate network request delay (800ms)
      await new Promise(resolve => setTimeout(resolve, 800));

      // Calculate next simulation ID using localStorage
      let currentId = parseInt(localStorage.getItem('yju_member_id_counter') || '0', 10);
      currentId += 1;
      localStorage.setItem('yju_member_id_counter', currentId.toString());

      // Get values
      const usernameVal = fields.username.input.value.trim();
      const pwdVal = fields.password.input.value;
      const emailVal = fields.email.input.value.trim();
      const phoneVal = fields.phone.input.value.trim();
      
      // Get hashed password using standard Crypto Web API (SHA-256)
      const hashedPassword = await hashPasswordSHA256(pwdVal);
      
      // Get current formatted datetime
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ` +
                            `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      // Populate success modal
      modalData.id.innerText = currentId;
      modalData.username.innerText = usernameVal;
      modalData.password.innerText = hashedPassword;
      modalData.email.innerText = emailVal;
      modalData.phone.innerText = phoneVal;
      modalData.date.innerText = formattedDate;

      // 1. 아이디 중복 체크
      const { data: existingUser, error: checkError } = await supabaseClient
        .from('members')
        .select('id')
        .eq('username', usernameVal)
        .maybeSingle();

      if (checkError) throw checkError;
      
      if (existingUser) {
        setFieldState(fields.username, false, '이미 사용 중인 아이디입니다.');
        fields.username.input.focus();
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalText;
        return;
      }

      // 2. 실제 DB 등록 (members 테이블)
      const { data: memberData, error: memberError } = await supabaseClient
        .from('members')
        .insert([{
          username: usernameVal,
          password: hashedPassword,
          email: emailVal,
          phone: phoneVal
        }])
        .select()
        .single();

      if (memberError) throw memberError;

      // 3. 약관 동의 이력 보관 (terms_agreements 테이블)
      const { error: termsError } = await supabaseClient
        .from('terms_agreements')
        .insert([{
          member_id: memberData.id,
          terms_version: 'v1.0',
          is_agreed: true
        }]);

      if (termsError) throw termsError;

      // LocalStorage에도 동기화 (기존 호환성용)
      const registeredUser = {
        username: usernameVal,
        password: hashedPassword,
        email: emailVal,
        phone: phoneVal
      };
      let users = JSON.parse(localStorage.getItem('yju_users') || '[]');
      users = users.filter(u => u.username !== usernameVal);
      users.push(registeredUser);
      localStorage.setItem('yju_users', JSON.stringify(users));

      // 모달 데이터 바인딩 (실제 DB ID 사용)
      modalData.id.innerText = memberData.id;
      modalData.username.innerText = memberData.username;
      modalData.password.innerText = memberData.password;
      modalData.email.innerText = memberData.email;
      modalData.phone.innerText = memberData.phone;
      modalData.date.innerText = new Date(memberData.created_at).toLocaleString();

      // Show Modal
      successModal.classList.add('active');
      successModal.setAttribute('aria-hidden', 'false');

    } catch (err) {
      console.error('Error database registration: ', err);
      alert('데이터베이스 저장 중 오류가 발생했습니다: ' + err.message);
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = originalText;
    }
  });

  // Close modal and redirect to portal login page
  btnCloseModal.addEventListener('click', () => {
    successModal.classList.remove('active');
    successModal.setAttribute('aria-hidden', 'true');
    // Redirect to login page
    window.location.href = 'login.html?v=2';
  });


  // --- Cryptography Helper ---
  async function hashPasswordSHA256(password) {
    try {
      const msgBuffer = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (e) {
      // Fallback in case crypto is not supported in the user environment (HTTP instead of HTTPS in some browsers)
      return "pbkdf2_sha256$260000$" + btoa(password).substring(0, 16) + "...(Simulated)";
    }
  }

});
