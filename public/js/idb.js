let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) { 
    const db = event.target.result;
    db.createObjectStore('new_payment', { autoIncrement: true });
  };

request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadPayment();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_payment'], 'readwrite');
    const paymentObjectStore = transaction.objectStore('new_payment');
  
    paymentObjectStore.add(record);
}

function uploadPayment() {
    // open a transaction on your db
    const transaction = db.transaction(['new_payment'], 'readwrite');
  
    // access your object store
    const paymentObjectStore = transaction.objectStore('new_payment');
  
    // get all records from store and set to a variable
    const getAll = paymentObjectStore.getAll();

    // upon a successful .getAll() execution, run this function
getAll.onsuccess = function() {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 1) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const transaction = db.transaction(['new_payment'], 'readwrite');
          const paymentObjectStore = transaction.objectStore('new_payment');
          paymentObjectStore.clear();

          alert('All saved payments have been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    } else if (getAll.result.length = 1) {
        fetch('/api/transaction', {
          method: 'POST',
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          }
        })
          .then(response => response.json())
          .then(serverResponse => {
            if (serverResponse.message) {
              throw new Error(serverResponse);
            }
            const transaction = db.transaction(['new_payment'], 'readwrite');
            const paymentObjectStore = transaction.objectStore('new_payment');
            paymentObjectStore.clear();
  
            alert('Saved payment has been submitted!');
          })
          .catch(err => {
            console.log(err);
          });
      }
  };
}

window.addEventListener('online', uploadPayment);