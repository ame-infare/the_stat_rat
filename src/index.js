async function getTemplate(path) {
    const response = await fetch(path);
    const template = await response.text();
    return document.createRange().createContextualFragment(template);
}

let navButtons = document.querySelectorAll('#nav li');
navButtons.forEach(button => setUpNavButton(button));
