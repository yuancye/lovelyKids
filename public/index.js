'use strict';

/**
 * Name: Yuanchao Ye
 * Date: 05-01-2024
 * Section: AA/Kevin Wu
 *
 * This is the front end part of the Lovely Kids App. It allows
 * users to manage and track "stars"
 * or points for children's behavior management  by mimicing a
 * real "Rule of Living".
 *
 * It features a user interface for kid tag creatation, rule
 * generation, and stars management system. User can assign
 * specific rules to specific kids, and updating the star counts
 * for each user based on their behaviors (rules).
 *
 * TODO:
 * 1. let user to update/delete the existing rules.
 * 2. user can delete the kid's info.
 * 3. add a parent's username to restric the access to their own
 * kids' profil.
 */
(function() {
  let iconId;
  let curUser;
  let showUser = false;

  window.addEventListener('load', init);

  /**
   * Initializes the Lovely Kid App by setting up event listeners and displaying initial content.
   */
  function init() {
    id('score-container').classList.remove('hidden');
    showScores();
    setLinks();
    fetchIcons();
    id('add-kid').addEventListener('click', saveUser);
    id('add-line').addEventListener('click', addInputLine);
    id('remove-line').addEventListener('click', removeInputLine);
    id('clear-all').addEventListener('click', () => {
      id('rules').innerHTML = '';
    });
    qs('#user-creator > a').addEventListener('click', goToRuleGenerator);
    qs('#rules-generator a').addEventListener('click', goToStars);
    qs('#score-container a').addEventListener('click', goToCreateUser);
    id('update-stars').addEventListener('click', updateStars);
  }

  /**
   * Sets up the behavior for navigation links.
   */
  function setLinks() {
    const links = qsa('nav ul li a');
    links.forEach(link => {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        const sectionId = this.getAttribute('href').substring(1);
        showSection(sectionId);
      });
    });
  }

  /**
   * Switches the view to the rule generator section.
   */
  function goToRuleGenerator() {
    id('user-creator').classList.add('hidden');
    id('rules-generator').classList.remove('hidden');
    fetchName();
  }

  /**
   * Switches the view to the stars section.
   */
  function goToStars() {
    id('rules-generator').classList.add('hidden');
    id('score-container').classList.remove('hidden');
    showScores();
  }

  /**
   * Switches the view to the user creator section.
   */
  function goToCreateUser() {
    id('score-container').classList.add('hidden');
    id('user-creator').classList.remove('hidden');
  }

  /**
   * Displays the specified section while hiding others.
   * @param {string} sectionId - The ID of the section to display.
   */
  function showSection(sectionId) {
    const sections = qsa('main > section');
    sections.forEach(section => {
      section.classList.add('hidden');
    });

    if (sectionId === 'rules-generator') {
      fetchName();
    }

    if (sectionId === 'score-container') {
      showScores();
    }

    const selectedSection = id(sectionId);
    selectedSection.classList.remove('hidden');
  }

  /**
   * Retrieve icons from the server and displays them.
   */
  function fetchIcons() {
    fetch('/icons')
      .then(statusCheck)
      .then(res => res.json())
      .then(res => displayIcons(res.icons))
      .catch(handleError);
  }

  /**
   * Displays the retrieved icons.
   * @param {Array} data - The array of icon URLs.
   */
  function displayIcons(data) {
    let parent = id('icon-container');
    parent.innerHTML = '';

    let legend = gen('legend');
    legend.textContent = 'Choose your Icons';
    parent.appendChild(legend);

    for (let i = 0; i < data.length; i++) {
      let img = gen('img');
      img.src = data[i].replace('public', '');
      let imgName = data[i].split('/').pop()
        .split('.')[0];
      img.alt = imgName;
      img.id = imgName;
      img.addEventListener('click', chooseIcon);
      parent.appendChild(img);
    }
  }

  /**
   * Handles the click event when an icon is chosen by the user.
   */
  function chooseIcon() {
    qsa('#icon-container img').forEach(img => {
      img.classList.remove('highlighted');
    });
    this.classList.toggle('highlighted');
    iconId = this.id;
  }

  /**
   * Sends a request to save user data to the server.
   */
  function saveUser() {
    let userInfo = new FormData();
    iconId = (iconId === null || iconId === undefined) ? 'lion' : iconId;
    userInfo.append('username', id('username').value);
    userInfo.append('icon', iconId);
    fetch('/saveuser', {
      method: 'POST',
      body: userInfo
    })
      .then(statusCheck)
      .then(res => res.text())
      .then(displayMessage)
      .catch(handleError);
  }

  /**
   * Adds an input line to the rule generator form.
   */
  function addInputLine() {
    let parent = id('rules');
    let divTag = gen('div');
    let labelTag1 = gen('label');
    let inputTag1 = gen('input');
    inputTag1.type = 'text';
    inputTag1.placeholder = 'rule name';
    labelTag1.append(inputTag1);

    let labelTag2 = gen('label');
    let inputTag2 = gen('input');
    inputTag2.type = 'number';
    inputTag2.placeholder = 'score';
    labelTag2.append(inputTag2);
    divTag.appendChild(labelTag1);
    divTag.appendChild(labelTag2);
    parent.appendChild(divTag);
  }

  /**
   * Removes the last input line from the rule generator form.
   */
  function removeInputLine() {
    let parent = id('rules');
    let lastChild = parent.lastChild;

    if (lastChild) {
      parent.removeChild(lastChild);
    }
  }

  /**
   * Sends a request to save user-defined rules to the server.
   */
  function saveRules() {
    let rules = getFormData();
    let user = this.id;
    let formData = new FormData();
    formData.append('rules', JSON.stringify(rules));
    formData.append('username', user);
    fetch('/saverules', {
      method: 'POST',
      body: formData
    })
      .then(statusCheck)
      .then(res => res.text())
      .then(displayMessage)
      .catch(handleError);
  }

  /**
   * Retrieves form data from the rule generator form.
   * @returns {Object} - An object containing the form data.
   */
  function getFormData() {
    const formData = {};

    const pairs = qsa('#rules div');
    pairs.forEach(pair => {
      const inputs = pair.querySelectorAll('input');
      const ruleName = inputs[0].value;
      const score = inputs[1].value;

      if (ruleName && score) {
        formData[ruleName] = score;
      }
    });

    return formData;
  }

  /**
   * Retrieval user names from the server and displays them.
   */
  function fetchName() {
    fetch('/getname')
      .then(statusCheck)
      .then(res => res.json())
      .then(displayUserButton)
      .catch(handleError);
  }

  /**
   * Displays user names as for rule assignment.
   * @param {Object} res - The response containing user names  from server .
   */
  function displayUserButton(res) {
    let parent = id('add-rules-to-user');
    parent.innerHTML = '';
    res.users.forEach(user => {
      let buttonTag = gen('button');
      buttonTag.id = user;
      buttonTag.textContent = capitalizeFirstLetter(user);
      buttonTag.addEventListener('click', saveRules);
      parent.appendChild(buttonTag);
    });
  }

  /**
   * Display user data and update the stars.
   */
  function showScores() {
    if (!showUser) {
      fetchUserData();
      showUser = true;
    }
  }

  /**
   * Fetches user data from the server and displays it.
   */
  function fetchUserData() {
    fetch('/getuserinfo')
      .then(statusCheck)
      .then(res => res.json())
      .then((res) => createUser(res.users))
      .catch(handleUserError);
  }

  /**
   * Creates user elements with their respective scores.
   * @param {Object} users - Object containing user data.
   */
  function createUser(users) {
    let parent = id('users');
    parent.innerHTML = '';
    Object.entries(users).forEach(([key, value]) => {
      let userDiv = gen('div');
      userDiv.classList.add(key);
      let iconImg = gen('img');
      let namePTag = gen('p');
      let starPTag = gen('p');
      starPTag.classList.add('star');
      if (value.icon) {
        iconImg.src = '/icons/' + value.icon + '.png';
        iconImg.alt = value.icon;
      }
      namePTag.textContent = key;
      starPTag.textContent = value.star + ' stars';
      userDiv.appendChild(iconImg);
      userDiv.appendChild(namePTag);
      userDiv.appendChild(starPTag);
      parent.appendChild(userDiv);
      userDiv.addEventListener('click', () => {
        curUser = key;
        displayRules(value.rules);
      });
      userDiv.addEventListener('click', toggleHighlightView);
    });
  }

  /**
   * highlighted the selected element.
   */
  function toggleHighlightView() {
    qsa('#users div').forEach(user => {
      user.classList.remove('highlighted');
    });

    this.classList.toggle('highlighted');
  }

  /**
   * Displays user-defined rules in the rule selection area.
   * @param {Object} rules - Object containing user-defined rules.
   */
  function displayRules(rules) {
    let parent = id('events-container');
    parent.innerHTML = '';
    let legend = gen('legend');
    legend.textContent = 'Click to choose Events';
    parent.appendChild(legend);
    if (rules !== null && rules !== undefined) {
      Object.entries(rules).forEach(([key, value]) => {
        let btn = gen('button');
        let evtSpan = gen('span');
        let scoreSpan = gen('span');
        evtSpan.textContent = key;
        scoreSpan.textContent = value;
        btn.appendChild(evtSpan);
        btn.appendChild(scoreSpan);
        btn.addEventListener('click', toggleHighlighted);
        parent.appendChild(btn);
      });
    }
  }

  /**
   * highlighted or de-highlighted the selected element.
   */
  function toggleHighlighted() {
    this.classList.toggle('highlighted');
  }

  /**
   * Updates the stars for the selected user based on the chosen events.
   */
  function updateStars() {
    let clickedEvent = qsa('#events-container .highlighted');
    let curStar = parseInt(qs(`#users .${curUser} .star`).textContent);
    clickedEvent.forEach(click => {
      let score = click.querySelector('span~span').textContent;
      curStar += parseInt(score);
      click.classList.toggle('highlighted');
    });

    qs('#users .highlighted').classList.toggle('highlighted');

    qs(`#users .${curUser} .star`).textContent = curStar;
    saveStars(curStar);
  }

  /**
   * Sends a request to save star scores for the selected user.
   * @param {number} curStar - The current stars the the user has.
   */
  function saveStars(curStar) {
    let data = new FormData();
    data.append('star', curStar);
    data.append('user', curUser);

    fetch('/saveStars', {
      method: 'POST',
      body: data
    })
      .then(statusCheck)
      .then(res => res.text())
      .then(displayMessage)
      .catch(handleError);
  }

  /**
   * Displaying error messages.
   * @param {Error} err - The error object.
   */
  function handleError(err) {
    qs('.error').classList.remove('hidden');
    qs('.error').textContent = err.message;
    qs('body').addEventListener('click', function() {
      qs('.error').classList.add('hidden');
    });
  }

  /**
   * Re-direct the user to the create user section if there is
   * problem related to user data retrieval.
   * @param {Error} err - The error object.
   */
  function handleUserError() {
    qs('#score-container .error').classList.remove('hidden');
    id('events-container').classList.add('hidden');
    id('update-stars').classList.add('hidden');
    qs('#score-container a').addEventListener('click', () => {
      qs('#score-container .error').classList.add('hidden');
      id('events-container').classList.remove('hidden');
      id('update-stars').classList.remove('hidden');
    });
  }

  /**
   * Displays message to the user.
   * @param {string} message - The message to be displayed.
   */
  function displayMessage(message) {
    qsa('#icon-container img').forEach(img => {
      img.classList.remove('highlighted');
    });

    qs('.message').classList.remove('hidden');
    qs('.message').textContent = message;
    qs('body').addEventListener('click', function() {
      qs('.message').classList.add('hidden');
    });
    showUser = false;
  }

  /**
   * Capitalizes the first letter of a string.
   * @param {string} str - The input string.
   * @returns {string} - The string with the first letter capitalized.
   */
  function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Helper function to return the response's result text if
   * successful, otherwise returns the rejected Promise result
   * with an error status and corresponding text
   * @param {object} res - response to check for success/error
   * @return {object} - valid response if response was successful,
   * otherwise rejected Promise result
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Returns the element that has the ID attribute with the
   * specified value.
   * @param {string} id - element ID
   * @return {object} DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Returns the element that has the matches the selector passed.
   * @param {string} selector - selector for element
   * @return {object} DOM object associated with selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Wrapper function for querySelectorAll.
   * Selects all elements in the DOM that match the given CSS
   * selector.
   * @param {string} selector: The CSS selector.
   * @return {NodeList | []} - A NodeList containing all
   * elements that match the selector or [] if no such
   * element exists
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Wrapper function for createElement.
   * Generates a new DOM element with the specified tag name.
   * @param {string} tagName - The tag name of the element to be created.
   * @return {Element} - The newly created DOM element.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }
})();
