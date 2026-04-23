let apiURL = '';
if(location.protocol === 'https:') {
    apiURL = 'https://city-explorer-lovat.vercel.app/api/todos/'
}else {
    apiURL = 'http://localhost:4000/api/todos/'
}

const itemForm = document.getElementById('item-form');
const itemFormBtn = document.querySelector('#item-form button');
const itemInput = document.getElementById('item-input');
const itemList = document.getElementById('item-list');
const clearBtn = document.getElementById('clear');
const filter = document.getElementById('filter');
const loadSpinner = document.getElementById('spinner-container');

function showBtnSpinner() {
    itemFormBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Please wait...';
}

function hideBtnSpinner() {
    setTimeout(()  => {
        itemFormBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Todo';
    }, 800);
}

function showSpinner() {

}

function hideLoadingSpinner() {
    setTimeout(() => {
        loadSpinner.style.opacity = 0; // this will hide the spinner
        loadSpinner.style.transition = 'opacity 0.5s'; // fadeout in half a second
        setTimeout(() => {
            loadSpinner.style.display = 'none';
        }, 500);
    }, 500);
}


// Start create button functionality
function createButton(textColor = 'black', iconName = '', ...classes) {
    const button = document.createElement('button');
    button.className = `btn-link text-${textColor}`;
    classes.forEach(c => button.classList.add(c));
    if(iconName !== '') {
        const icon = createIcon(iconName);
        button.appendChild(icon);
    }
    return button;
}
function createIcon(iconName) {
    const icon = document.createElement('i');
    icon.className = `fa-solid fa-${iconName}`;
    return icon;
}

function createListItem(item) {
    let listItem = document.createElement('li');
    listItem.appendChild(document.createTextNode(item[0]));
    listItem.setAttribute('data-id', item[1]);
    const button = createButton('red', 'circle-xmark', 'remove-item');
    listItem.appendChild(button);
    itemList.appendChild(listItem);
}
// End create button functionality

// Start localStorage functionality
function getItemsFromStorage() {
    let listItemsArr = [];

    fetch(apiURL, {
        method: 'GET'
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Server responded with status: ${res.status}`);
            }
            return res.json();
        })
        .then(json => {
            if (!json.data || !Array.isArray(json.data)) {
                console.error('Unexpected response format:', json);
                return;
            }

            // Clear the list first - IMPORTANT: This was missing
            itemList.innerHTML = '';

            const todos = json.data;
            todos.forEach(todo => {
                const title = todo.title;
                const id = todo._id;
                listItemsArr.push([title, id]);
            });

            // Render todos
            listItemsArr.forEach(item => {
                createListItem(item);
            });
        })
        .catch(error => {
            console.error('Error fetching todos:', error);
            // Optionally show an error message to the user
            itemList.innerHTML = `<li class="error">Error loading todos: ${error.message}</li>`;
        })
        .then(function() {
            hideLoadingSpinner();
            hideBtnSpinner();
        });
}

function storeListItem(itemName) {
    if(itemName !== "") {
        // Check for duplicates before proceeding
        if (isDuplicate(itemName)) {
            alert('This item is already on your list!');
            hideBtnSpinner();
            return;
        }

        fetch(apiURL, {
            method: 'POST',
            body: JSON.stringify({title: itemName}),
            headers: {'content-type': 'application/json; charset=UTF-8'}
        }).then(res => res.json())
            .then(json => {
                if (json.success) {
                    // Get the ID from the response and create the proper array
                    const newTodo = json.data;
                    createListItem([newTodo.title, newTodo._id]);
                }
            })
            .then(function() {
                hideBtnSpinner();
            });
    } else {
        hideBtnSpinner();
    }
}

function setUp() {
    // Clear list here before fetching todos
    itemList.innerHTML = '';
    getItemsFromStorage();
}

function isDuplicate(newItemName) {
    newItemName = newItemName.toLowerCase().trim();
    // Get all current list items
    const listItems = itemList.querySelectorAll('li');
    // Check if any existing item text matches the new item text (case insensitive)
    for (let i = 0; i < listItems.length; i++) {
        const itemText = listItems[i].textContent.replace(/\s*×\s*$/, '').toLowerCase().trim();
        if (itemText === newItemName) {
            return true;
        }
    }
    return false;
}

// function to check for duplicates except the current item
function isDuplicateExcept(newItemName, exceptItem) {
    newItemName = newItemName.toLowerCase().trim();

    // Get all current list items
    const listItems = itemList.querySelectorAll('li');

    // Check if any existing item text matches the new item text (case insensitive)
    for (let i = 0; i < listItems.length; i++) {
        // Skip the item we're editing
        if (listItems[i] === exceptItem) {
            continue;
        }

        const itemText = listItems[i].textContent.replace(/\s*×\s*$/, '').toLowerCase().trim();
        if (itemText === newItemName) {
            return true;
        }
    }

    return false;
}

// Start Update/Delete functionality
let editingItemId = null; // Will store the ID of the item being edited

// Replace your updateItem function with this version
function updateItem(item) {
    // Get the item ID
    const itemId = item.getAttribute('data-id');

    // If we're already editing this item, do nothing
    if (editingItemId === itemId) {
        return;
    }

    // Otherwise, set this as the item being edited
    editingItemId = itemId;

    // Extract just the text content without the button text
    const itemText = item.childNodes[0].nodeValue.trim();
    console.log('Item text to edit:', itemText);

    // Step 1: place the item's text in the form's input field
    itemInput.value = itemText;

    // Step 2: Change the Add button to an Update button
    itemFormBtn.innerHTML = '<i class="fa-solid fa-pen"></i> Update Item';
    itemFormBtn.style.backgroundColor = '#228B22';

    // Step 3: Change the style of all buttons except the one that was clicked
    itemList.querySelectorAll('li').forEach(i => {
        i.classList.remove('edit-mode');
        i.style.backgroundColor = '';
        i.style.borderColor = '';
    });

    item.classList.add('edit-mode');
    item.style.backgroundColor = 'rgba(34, 139, 34, 0.1)'; // Light green background
    item.style.borderColor = '#228B22'; // Green border

    // Step 4: Set focus on the input field and select all text
    itemInput.focus();
    itemInput.select();
}

// Replace your turnOffEdit function with this version
function turnOffEdit(item) {
    // Reset the editing item ID
    editingItemId = null;

    // Step 1: remove the text in the form's input field
    itemInput.value = "";

    // Step 2: Change the Update button back to Add button
    itemFormBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Item';
    itemFormBtn.style.backgroundColor = '#333';

    // Step 3: Remove the edit mode styling from the item
    item.classList.remove('edit-mode');
    item.style.backgroundColor = ''; // Remove inline style
    item.style.borderColor = ''; // Remove inline style
}


function inEditMode() {
    let editMode = false;
    const listItems = itemList.querySelectorAll('li');
    for (let i = 0; i < listItems.length; i++) {
        if(listItems[i].classList.contains('edit-mode')) {
            editMode = true;
            break;
        }
    }
    return editMode;
}

function updateListItem(itemName) {
    const editItem = itemList.querySelector('li.edit-mode');

    if (!editItem) {
        console.error('No item in edit mode');
        hideBtnSpinner();
        return;
    }

    const id = editItem.getAttribute('data-id');

    // Check for duplicates, but exclude the current item from the check
    if (isDuplicateExcept(itemName, editItem)) {
        alert('This item already exists in your list!');
        hideBtnSpinner();
        return;
    }

    // Create the update payload
    const toDo = {title: itemName};

    fetch(apiURL + id, {
        method: 'PUT',
        body: JSON.stringify(toDo),
        headers: {'content-type': 'application/json; charset=UTF-8'}
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Server responded with status: ${res.status}`);
            }
            return res.json();
        })
        .then(json => {
            if (json.success) {
                // Update the list item text
                editItem.textContent = "";
                editItem.appendChild(document.createTextNode(itemName));
                const button = createButton('red', 'circle-xmark', 'remove-item');
                editItem.appendChild(button);

                // Turn off edit mode and reset variables
                editingItemId = null;
                editItem.classList.remove('edit-mode');
                editItem.style.backgroundColor = '';
                editItem.style.borderColor = '';

                // Reset the form
                itemInput.value = "";
                itemFormBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Item';
                itemFormBtn.style.backgroundColor = '#333';
            } else {
                alert('Update failed: ' + (json.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error updating item:', error);
            alert('Failed to update item: ' + error.message);
        })
        .finally(() => {
            hideBtnSpinner();
        });
}

function deleteItem(itemElement, event) {
    // Prevent event bubbling and duplicate calls
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Get the li element that contains the clicked X icon
    const listItem = itemElement.closest('li');
    if (!listItem) return; // Exit if we can't find a parent li element

    const id = listItem.getAttribute('data-id');
    if (!id) return; // Exit if there's no ID

    // Add a flag to prevent duplicate deletes
    if (listItem.dataset.deleting === 'true') {
        console.log('Delete already in progress for this item');
        return;
    }

    // Mark item as being deleted
    listItem.dataset.deleting = 'true';

    // Ask for confirmation
    const confirmDelete = confirm(`Are you sure you want to delete this item?`);

    if (confirmDelete) {
        console.log('Attempting to delete item with ID:', id);

        // Use the dynamic apiURL variable instead of hardcoding
        fetch(`${apiURL}${id}`, {
            method: 'DELETE'
        })
            .then(res => {
                console.log('Delete response status:', res.status);

                if (res.ok) {
                    console.log('Delete request successful');
                    listItem.remove();
                    return res.json();
                } else {
                    // Remove the deleting flag if there's an error
                    listItem.dataset.deleting = 'false';
                    return res.text().then(text => {
                        console.error('Error response body:', text);
                        throw new Error(`Server returned ${res.status}`);
                    });
                }
            })
            .then(data => {
                console.log('Delete response data:', data);
            })
            .catch(error => {
                // Remove the deleting flag if there's an error
                if (listItem.parentNode) {
                    listItem.dataset.deleting = 'false';
                }
                console.error('Error deleting item:', error);
            });
    } else {
        // Remove the deleting flag if user cancels
        listItem.dataset.deleting = 'false';
    }
}

// End Update/Delete functionality

// Start Event Listeners
window.addEventListener('DOMContentLoaded', setUp);
itemForm.addEventListener('submit', (event) => {
    event.preventDefault();
    showBtnSpinner();
    let editMode = inEditMode();
    let inputItemValue = itemInput.value;
    if(inputItemValue !== '') {
        if (!editMode) {
            // Adding a new item
            storeListItem(inputItemValue);
            itemInput.value = '';
        } else {
            // Edit an existing item
            updateListItem(inputItemValue);
        }
    }
})

itemList.addEventListener('click', function (event) {
    // Prevent the event from bubbling up
    event.stopPropagation();

    // Handle different click targets
    if (event.target.classList.contains('fa-circle-xmark') ||
        (event.target.classList.contains('btn-link') &&
            event.target.parentElement &&
            event.target.parentElement.classList.contains('remove-item'))) {
        // Handle delete button click
        deleteItem(event.target, event);
        return;
    }

    // Find the list item that was clicked
    let listItem = null;

    if (event.target.tagName === 'LI') {
        listItem = event.target;
    } else if (event.target.parentElement && event.target.parentElement.tagName === 'LI') {
        listItem = event.target.parentElement;
    } else {
        // Click was not on a list item or its contents
        return;
    }

    // Toggle edit mode
    const itemId = listItem.getAttribute('data-id');

    if (editingItemId === itemId) {
        // We're already editing this item, so turn off edit mode
        turnOffEdit(listItem);
    } else {
        // Start editing this item
        updateItem(listItem);
    }
});

if (!clearBtn.dataset.listenerAttached) {
    clearBtn.addEventListener('click', function(event) {
        if (inEditMode()) {
            const editItem = itemList.querySelector('li.edit-mode');
            if (editItem) {
                turnOffEdit(editItem);
            }
            return;
        }
        let confirmClear = confirm('Are you sure you want to clear the list?');
        if (confirmClear) {
            fetch(apiURL, {
                method: 'DELETE'
            })
                .then(res => {
                    if (res.ok) {
                        itemList.innerHTML = '';
                        return res.json();
                    } else {
                        return res.text().then(text => {
                            throw new Error(`Server returned ${res.status}`);
                        });
                    }
                })
                .catch(error => {
                    console.error('Error deleting all items:', error);
                });
        }
    });

    clearBtn.dataset.listenerAttached = 'true';
}

// These events didn't work: change, keydown, keypress
filter.addEventListener('input', (event) => {
    const filterText = event.target.value.toLowerCase();

    // Get all current list items and filter them
    const listItems = itemList.querySelectorAll('li');

    listItems.forEach(item => {
        // Get the text content of the item (first child node)
        const itemText = item.childNodes[0].nodeValue.trim().toLowerCase();

        // Show or hide based on filter text
        if (itemText.includes(filterText)) {
            item.style.display = 'flex'; // Show the item
        } else {
            item.style.display = 'none'; // Hide the item
        }
    });
});