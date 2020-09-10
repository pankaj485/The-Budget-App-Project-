// !BUDGET CONTROLLER
let budgetController = (function () {
  // creating expense object
  let expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  // creating a prototype to calculate percentage of each node
  expense.prototype.calcPercentage = function (totalIncone) {
    if (totalIncone > 0) {
      this.percentage = Math.round((this.value / totalIncone) * 100);
    } else {
      this.percentage = -1;
    }
  };
  //  getting the calculated percentage of the node
  expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  // creating income object
  let income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // to calculate total income or expense
  let calculateTotal = function (type) {
    let sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  // to store all of required datas
  let data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    // adding user inut value on inc or exp databse
    addItem: function (type, des, val) {
      let newItem, ID;

      // create new id
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // cteate new item based on input type i.e 'inc' or 'exp'
      if (type === 'exp') {
        newItem = new expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new income(ID, des, val);
      }

      // pushing the new data into data structre
      data.allItems[type].push(newItem);

      // returning the new element
      return newItem;
    },

    deleteItem: function (type, id) {
      let ids, index;
      // The Map object holds key-value pairs and remembers the original insertion order of the keys. Any value (both objects and primitive values) may be used as either a key or a value.
      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);
      // The splice() method changes the contents of an array by removing or replacing existing elements and/or adding new elements in place.
      data.allItems[type].splice(index, 1);
    },

    // calculate budget using claculataetotal method
    calculateBudget: function () {
      // calculatee total income and expense
      calculateTotal('exp');
      calculateTotal('inc');

      // calculate the budget : income - expense
      data.budget = data.totals.inc - data.totals.exp;

      // calculate percentage of income
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    // calling calculatepercentage method for all of the items of the exp to show in the ui
    calculatePercentages: function () {
      data.allItems.exp.forEach(function (current) {
        current.calcPercentage(data.totals.inc);
      });
    },

    // method to calculate the percentage of the passed value
    getPercentages: function () {
      let allPercentage = data.allItems.exp.map(function (current) {
        return current.getPercentage();
      });
      return allPercentage;
    },

    // getting datas to calculate budget and also to show in screen
    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    // to show the user input and calculate data from database
    testing: function () {
      // console.log(data);
      console.log(data.allItems);
    },
  };
})();

// !UI CONTROLLER
let UIController = (function () {
  // storing the class of html into seprate object
  let documentDOMS = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomeConatiner: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLablel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercentage: '.item__percentage',
    dateLabel: '.budget__title--month',
  };

  let formatNumber = function (num, type) {
    let numSplit, integer, decimal;
    // abs is changing the value of num into absoulute value , i.e making posetive value anyway
    num = Math.abs(num);
    // to fixed is giving 2 numbers afer decimals wheather or not if there is decimal num already
    num = num.toFixed(2);

    numSplit = num.split('.');
    integer = numSplit[0];
    decimal = numSplit[1];

    if (integer.length > 3) {
      // The substr() method returns a portion of the string, starting at the specified index and extending for a given number of characters afterwards.
      integer = integer.substr(0, integer.length - 3) + ',' + integer.substr(integer.length - 3, 3);
    }

    // (type === 'exp' ? '-' : '+') is checking if the type is exp and if so it returns the '-' sign and if false it returns the '+' sign .
    // if (type ==='exp' ? sign = '-': sign = '+') is same but a dyanamic apporach
    return (type === 'exp' ? '-' : '+') + '' + integer + '.' + decimal;
  };

  // creataing a function to show the percentage on the ui
  let nodeListForEach = function (list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    // extracting the input from dom input by user
    getInput: function () {
      return {
        type: document.querySelector(documentDOMS.inputType).value,
        description: document.querySelector(documentDOMS.inputDescription).value,
        value: parseFloat(document.querySelector(documentDOMS.inputValue).value),
      };
    },

    // adding the datas with user input value
    addListItem: function (obj, type) {
      let html, newHtml, element;

      // create HTML string with placeholder text dependng on the type i.e 'inc' or 'exp'
      if (type === 'inc') {
        element = documentDOMS.incomeConatiner;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = documentDOMS.expensesContainer;

        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace the placeholder text with some actual data
      // replace method replaces the given string with the specified / passed string
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // inserting the HTML node into the ui
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function (selectorID) {
      let el = document.getElementById(selectorID);
      //  method to delete the node ,
      el.parentNode.removeChild(el);
    },

    // to clear the inputs afetr user inputs the data
    clearFields: function () {
      let fields, fieldsArray;
      // creating a string of description and input value
      fields = document.querySelectorAll(documentDOMS.inputDescription + ',' + documentDOMS.inputValue);

      // converting the fields string into array using slice and call method
      fieldsArray = Array.prototype.slice.call(fields);

      // clearing the previous entered values and descriptions
      // foreach accepts current , index and array in genral
      fieldsArray.forEach(function (current) {
        current.value = '';
      });

      // afetr hitting enter or okay moving cursor to description
      fieldsArray[0].focus();
    },
    displayBudget: function (obj) {
      let type;
      obj.budget > 0 ? (type = 'inc') : (type = 'exp ');
      // displaying the datas into the dom
      document.querySelector(documentDOMS.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(documentDOMS.incomeLablel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(documentDOMS.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
      // display percentage only if is greater than 0
      if (obj.percentage > 0) {
        document.querySelector(documentDOMS.percentageLabel).textContent = obj.percentage + '%';
      } else {
        // display on the percentage field if percentage is not valid
        document.querySelector(documentDOMS.percentageLabel).textContent = '...';
      }
    },

    // to show the percentage of each node afer the node of the num (node = html elemtnt in dom )
    displayPercentages: function (percentages) {
      let fields = document.querySelectorAll(documentDOMS.expensesPercentage);

      // calling the function and giving appropriate fields for each conditions
      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },

    displayMonth: function () {
      let now, monthsArray, currentMonth, currentYear;
      // Date() is a method to get the current date
      now = new Date();

      monthsArray = [
        'Janauary',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      // method to get current month
      currentMonth = now.getMonth();

      // method to get current year
      currentYear = now.getFullYear();
      document.querySelector(documentDOMS.dateLabel).textContent = monthsArray[currentMonth] + ' ' + currentYear;
    },

    // to change the ui when user clicks on income or expense with different theme
    changedType: function () {
      let fields = document.querySelectorAll(
        documentDOMS.inputType + ',' + documentDOMS.inputDescription + ',' + documentDOMS.inputValue
      );

      nodeListForEach(fields, function (currentItem) {
        // adds red-focus class if not present and removes if present
        currentItem.classList.toggle('red-focus');
      });
      // adding red class to the tick button if absent and remove it is present
      document.querySelector(documentDOMS.inputButton).classList.toggle('red');
    },

    getDOMStrings: function () {
      // returning the dom classes so that other functions can also access it later
      return documentDOMS;
    },
  };
})();

// !GLOBAL APP CONTROLLER
let controller = (function (budgetCtrl, UICtrl) {
  // get all of the event listeners of the documents
  let setupEventListeners = function () {
    // getting the dom class from the uicontroller
    let DOM = UIController.getDOMStrings();

    // using ctrlAddItem function on click ot entering the enter key
    document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };

  let updateBudget = function () {
    // 1. calculate the budget
    budgetCtrl.calculateBudget();

    // 2. return the budget
    let budget = budgetCtrl.getBudget();

    // 3. display the budget to the ui
    UIController.displayBudget(budget);
  };
  let updatePercentage = function () {
    // 1. calculate percentages

    budgetCtrl.calculatePercentages();

    // 2. read percentages form the budget controller

    let percentages = budgetCtrl.getPercentages();

    // 3. update the ui with the new percentages
    UICtrl.displayPercentages(percentages);
  };

  let ctrlAddItem = function () {
    let input, newItem;

    // 1. Get the field input data
    input = UICtrl.getInput();

    // doing further calculations only if 1) the value of money is not NAN i.e is valid number 2) the description string is not empty 3) input value is greater than 0
    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // 2. add the item to the budget controller
      newItem = budgetController.addItem(input.type, input.description, input.value);

      // 3. add the item to the ui
      UICtrl.addListItem(newItem, input.type);

      // 4. clear the fields
      UICtrl.clearFields();

      // 5. calculate and update the budget
      updateBudget();

      // 6. calculate and update percentage
      updatePercentage();
    }
  };

  let ctrlDeleteItem = function (event) {
    let itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      // inc-1
      // after split , the string is changed into an array
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. delete the item from the data structre
      budgetController.deleteItem(type, ID);

      // 2. delete the item from the ui
      UIController.deleteListItem(itemID);

      // 3. update eand show the new budget
      updateBudget();

      // 4. calculate and update percentage
      updatePercentage();
    }
  };

  return {
    init: function () {
      // to know if the application is started or not
      console.log('applicataion started ');
      // to show the detail about which time it is right on the start of the program
      UICtrl.displayMonth();
      // disply every label as 0 at the starting of the program
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setupEventListeners();
    },
  };
})(budgetController, UIController);

controller.init();
