const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzkHKdidRARYcd42mLq94yh0AfXi0vN73BxFCqUf__bokNWzxdUREuEMjvY7xPQ8Us/exec";
 
let transactionCounter = 0;
let transactionHistory = [];

function processBill() {
    const nameInput = document.getElementById('customerName').value.trim();
    const consumptionInput = parseFloat(document.getElementById('consumption').value);
    const typeInput = document.getElementById('customerType').value;
    const btn = document.getElementById('btnGenerate');

    document.getElementById('nameError').style.display = 'none';
    document.getElementById('consumptionError').style.display = 'none';

    let isValid = true;

    if (nameInput === "") {
        document.getElementById('nameError').style.display = 'block';
        isValid = false;
    }
    if (isNaN(consumptionInput) || consumptionInput < 0) {
        document.getElementById('consumptionError').style.display = 'block';
        isValid = false;
    }

    if (!isValid) return;

    btn.disabled = true;
    btn.textContent = "Processing...";

    let grossAmount = 0;
    let remaining = consumptionInput;

    if (remaining > 60) {
        grossAmount += (remaining - 60) * 60;
        remaining = 60;
    }
    if (remaining > 40) {
        grossAmount += (remaining - 40) * 45;
        remaining = 40;
    }
    if (remaining > 20) {
        grossAmount += (remaining - 20) * 35;
        remaining = 20;
    }
    if (remaining > 0) {
        grossAmount += remaining * 25;
    }

    let discountRate = 0;
    switch (typeInput) {
        case "Senior Citizen":
            discountRate = 0.25;
            break;
        case "Solo Parent":
            discountRate = 0.15;
            break;
        case "Regular":
        default:
            discountRate = 0.00;
            break;
    }

    let discountAmount = grossAmount * discountRate;
    let totalAmountDue = grossAmount - discountAmount;

    document.getElementById('outName').textContent = nameInput;
    document.getElementById('outConsumption').textContent = consumptionInput;
    document.getElementById('outType').textContent = typeInput;
    document.getElementById('outGross').textContent = grossAmount.toFixed(2);
    document.getElementById('outDiscount').textContent = discountAmount.toFixed(2);
    document.getElementById('outTotal').textContent = totalAmountDue.toFixed(2);

    document.getElementById('billingStatement').style.display = 'block';

    transactionCounter++;
    document.getElementById('transactionCount').textContent = transactionCounter;

    transactionHistory.push(`${nameInput} - ₱${totalAmountDue.toFixed(2)}`);

    const logList = document.getElementById('logList');
    logList.innerHTML = ""; 

    for (let i = 0; i < transactionHistory.length; i++) {
        let li = document.createElement('li');
        li.textContent = transactionHistory[i];
        logList.appendChild(li);
    }

    const payload = {
        customerName: nameInput,
        consumption: consumptionInput,
        customerType: typeInput,
        discount: discountAmount.toFixed(2),
        finalBill: totalAmountDue.toFixed(2)
    };

    fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
    })
    .then(() => {
        alert("Bill generated and saved to Google Sheets successfully!");
        document.getElementById('customerName').value = "";
        document.getElementById('consumption').value = "";
        document.getElementById('customerType').value = "Regular";
    })
    .catch((error) => {
        alert("Bill generated, but failed to save to Google Sheets. Check console.");
        console.error(error);
    })
    .finally(() => {
        btn.disabled = false;
        btn.textContent = "Generate Bill & Save";
    });
}

function resetCurrent() {
    document.getElementById('customerName').value = "";
    document.getElementById('consumption').value = "";
    document.getElementById('customerType').value = "Regular";

    document.getElementById('nameError').style.display = 'none';
    document.getElementById('consumptionError').style.display = 'none';

    document.getElementById('billingStatement').style.display = 'none';
}