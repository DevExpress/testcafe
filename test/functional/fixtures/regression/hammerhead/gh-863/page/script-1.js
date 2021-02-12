document.addEventListener('DOMContentLoaded', () => {
    const div = document.createElement('div');

    div.textContent = 'Test element';
    div.id          = 'test-div';

    document.body.appendChild(div);
});
