document.addEventListener('DOMContentLoaded', () => {
    const dbSaveForm = document.getElementById('dbSaveForm');
    const timeBasedForm = document.getElementById('timeBasedForm');
    const dbSearchForm = document.getElementById('dbSearchForm');

    dbSaveForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const customer_name = e.target.customer_name.value;
        const dob = e.target.dob.value;
        const monthly_income = e.target.monthly_income.value;

        const response = await fetch('/db-save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customer_name, dob, monthly_income })
        });

        const data = await response.json();
        document.getElementById('dbSaveResponse').textContent = data.message || data.error;
    });

    timeBasedForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const customer_name = e.target.customer_name.value;
        const dob = e.target.dob.value;
        const monthly_income = e.target.monthly_income.value;

        const response = await fetch('/time-based-api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customer_name, dob, monthly_income })
        });

        const data = await response.json();
        document.getElementById('timeBasedResponse').textContent = data.message || data.error;
    });

    dbSearchForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const response = await fetch('/db-search');
        const data = await response.json();

        document.getElementById('dbSearchResponse').textContent = 
            `Customer Names: ${data.customer_names.join(', ')}, Time Taken: ${data.time_taken} seconds`;
    });
});
