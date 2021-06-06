// CONSTANT
const BASE_URL = " http://localhost:3000"

// **** SERVER REQUEST **** //
const postFormData = async (api_key, formDataToBeSent) => {
  const result = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${api_key}`
    },
    body: JSON.stringify(formDataToBeSent) // .stringify is critical 
  })
  return result.json() // .json is critical 
}

const getTargetsFromServer = async () => {
  const result = await fetch(BASE_URL)
  return result
}

// FORM FIELDS
const apiKeyInputField = document.getElementById('api_key')
const contentInputField = document.getElementById('content')
const targetSelectField = document.getElementById('target')
const submitButton = document.getElementById('submit_button')
const viewPortal = document.getElementById('view_portal')

let local_form_data = {};

// **** READ DATA **** //

getTargetsFromServer()
.then(result => result.json())        // .json is critical 
.then(data => generateTargets(data))  // double .then is critical 
.catch(error => viewPortal.innerText = "error")

// fill the input fields with data
chrome.storage.sync.get(["form_data"], ({form_data}) => {
  local_form_data = form_data
  
  apiKeyInputField.value = form_data.api_key
  contentInputField.innerText = form_data.content

  // if user didn't select don't update
  // this will prevent us from empty select display
  if(form_data.target) {
    targetSelectField.value = form_data.target
  }

  // viewPortal.innerText = JSON.stringify(form_data)
});






// EVENT LISTENERS
apiKeyInputField.addEventListener('keyup', (e) => {
  const { value } = e.target
  updateFormData('api_key', value)
})

contentInputField.addEventListener('keyup', (e) => {
  const { value } = e.target
  updateFormData('content', value)
})

targetSelectField.addEventListener('change',(e) => {
  const { value } = e.target
  updateFormData('target', value)
})

submitButton.addEventListener('click', () => {
  const { api_key, content, target } = local_form_data
  const data = { content, target}
  
  if(isFormValid()){
    postFormData(api_key, data)
      .then(result => {
        // clean the content after upload
          viewPortal.innerText =  result.message
          updateFormData('content', '')
        })
      .catch(error => viewPortal.innerText = JSON.stringify(error))

  } else {
    viewPortal.innerText = 'Fill fields properly'
  }
})





// **** HERLPER FUNCTIONS ****
 const saveFormData = (value) => {
  chrome.storage.sync.set({'form_data': value}, () => {})
}

const updateFormData = (source, value) => {
  local_form_data[source] = value
  saveFormData(local_form_data)
  trackFormValidation()
}

const generateTargets = (targetList = ['A', 'B', 'C']) => {
  targetList.forEach((target, index) => {
    const newOption = document.createElement('option')
    newOption.value = target
    newOption.textContent = target
    targetSelectField.appendChild(newOption)
  })
}

const trackFormValidation = () => {
  if(isFormDirty() && isFormValid()){
    submitButton.classList.add('valid')
    submitButton.disabled = false
  } else{
    submitButton.classList.remove('valid')
    submitButton.disabled = true
  }
}

const isFormDirty = () => {
  for(const key in local_form_data){
    if(local_form_data[key]) return true
  }
  return false
}

const isFormValid = () => {
  if(!local_form_data.api_key) return false
  if(!local_form_data.content) return false
  if(!local_form_data.target)  return false
  return true
}

