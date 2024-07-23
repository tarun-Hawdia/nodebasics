document.getElementById('dbSaveForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const customer_name = document.getElementById('customer_name').value;
    const dob = document.getElementById('dob').value;
    const monthly_income = document.getElementById('monthly_income').value;

    const response = await fetch('/db-save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customer_name, dob, monthly_income }),
    });

    const result = await response.json();
    document.getElementById('dbSaveResponse').innerText = result.message || result.error;
});

document.getElementById('timeBasedForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const customer_name = document.getElementById('time_customer_name').value;
    const dob = document.getElementById('time_dob').value;
    const monthly_income = document.getElementById('time_monthly_income').value;

    const response = await fetch('/time-based-api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customer_name, dob, monthly_income }),
    });

    const result = await response.json();
    document.getElementById('timeBasedResponse').innerText = result.message || result.error;
});

document.getElementById('dbSearchForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const response = await fetch('/db-search');
    const result = await response.json();
    document.getElementById('dbSearchResponse').innerHTML = `
        <p>Customer Names: ${result.customer_names.join(', ')}</p>
        <p>Time Taken: ${result.time_taken} seconds</p>
    `;
});
