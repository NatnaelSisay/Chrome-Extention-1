let form_data = {
  api_key: "",
  content: "",
  target: ""
};

chrome.storage.sync.set({'form_data': form_data}, () => {})
