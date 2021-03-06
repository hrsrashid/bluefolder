// Initialize app
var myApp = new Framework7({
  animateNavBackIcon: true,
  precompileTemplates: true,
  template7Pages: true,
  template7Data: {
    'page:goal': {id:0, title:"empty"},
    'page:mgoal': {id:0, title:"mempty"},
    'page:dgoal': {id:0, title:"dempty"}
  }
});

var $$ = Dom7;

// CALENDAR 

var monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август' , 'Сентябрь' , 'Октябрь', 'Ноябрь', 'Декабрь'];
 
var calendarInline = myApp.calendar({
    container: '#calendar-inline-container',
    value: [new Date()],
    weekHeader: false,
    toolbarTemplate: 
        '<div class="toolbar calendar-custom-toolbar">' +
            '<div class="toolbar-inner">' +
                '<div class="left">' +
                    '<a href="#" class="link icon-only"><i class="icon icon-back"></i></a>' +
                '</div>' +
                '<div class="center"></div>' +
                '<div class="right">' +
                    '<a href="#" class="link icon-only"><i class="icon icon-forward"></i></a>' +
                '</div>' +
            '</div>' +
        '</div>',
    onOpen: function (p) {
        $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
        $$('.calendar-custom-toolbar .left .link').on('click', function () {
            calendarInline.prevMonth();
        });
        $$('.calendar-custom-toolbar .right .link').on('click', function () {
            calendarInline.nextMonth();
        });
    },
    onMonthYearChangeStart: function (p) {
        $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
    },
    onChange: function() {
      if (dailyGoalsModel) {
        sync("#dgoalsTemplate", dailyGoalsModel);
        subsDeletion("dgoals");
        subsSelection('dgoal', dailyGoalsModel);
        $$(".daily-goals-slide .editing").addClass("hidden");
        isEditingGoals['daily-goals'] = false
      }
    }
});


var monthsCal = myApp.calendar({
  container: "#monthsCal",
  value: [new Date()],
  toolbarTemplate: 
    '<div class="toolbar calendar-custom-toolbar">' +
        '<div class="toolbar-inner">' +
            '<div class="left">' +
                '<a href="#" class="link icon-only"><i class="icon icon-back"></i></a>' +
            '</div>' +
            '<div class="center"></div>' +
            '<div class="right">' +
                '<a href="#" class="link icon-only"><i class="icon icon-forward"></i></a>' +
            '</div>' +
        '</div>' +
    '</div>',
    onOpen: function (p) {
        $$('#monthsCal .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
        $$('#monthsCal .left .link').on('click', function () {
            monthsCal.prevMonth();
        });
        $$('#monthsCal .right .link').on('click', function () {
            monthsCal.nextMonth();
        });
    },
    onMonthYearChangeStart: function (p) {
        $$('#monthsCal .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);

        if (monthlyGoalsModel) {
          monthlyGoalsModel.setMY(p.currentYear, p.currentMonth);
          sync("#mgoalsTemplate", monthlyGoalsModel);
          subsDeletion("mgoals");
          subsSelection('mgoal', monthlyGoalsModel);
          $$(".monthly-goals-slide .editing").addClass("hidden");
          isEditingGoals['monthly-goals'] = false
        }
    }
});


var goalsModel = loadModel('goals', {
  _ai: 3,
  goals: [
      {id: 1, title: "Цель номер 1", description: "Описание цели один"},
      {id: 2, title: "Цель номер 2", description: "Описание цели два"}
    ]
});

var monthlyGoalsModel = loadModel('mgoals', {
  _ai: 3,
  goals: [
    {id: 1, date: (new Date()).toISOString(), title: "Задача на месяц 1", description: "Описание 1"},
    {id: 2, date: (new Date()).toISOString(), title: "Задача на месяц 2", description: "Описание 2"}
  ]
});

var dailyGoalsModel = loadModel('dgoals', {
  _ai: 3,
  goals: [
    {id: 1, date: (new Date()).toISOString(), title: "Дело на день 1", description: "Описание д1"},
    {id: 2, date: (new Date()).toISOString(), title: "Дело на день 2", description: "Описание д2"}
  ]
});

 

goalsModel.new = function() { return {id: this._ai++, title: "Новая цель"}; }
goalsModel.get = function() { return this; }

monthlyGoalsModel.setMY = function(m, y) {
  this.m = m;
  this.y = y;
};
monthlyGoalsModel.new = function() {
  return {
    id: this._ai++,
    title: "Новая месячная задача",
    date: (new Date(this.y || (new Date()).getFullYear(), this.m || 0, 1)).toISOString() 
  };
};
monthlyGoalsModel.get = function() {
  var date = new Date(this.y || (new Date()).getFullYear(), this.m || 0, 1);

  return Object.assign({}, this, {goals:this.goals.filter(function(goal) {
    var gdate = new Date(goal.date);

    return gdate.getMonth() == date.getMonth()
      && gdate.getFullYear() == date.getFullYear();
  })})
};

dailyGoalsModel.new = function() {
  return {
    id: this._ai++,
    title: "Новое дневное дело",
    date: (new Date(calendarInline.value[0] || Date.now())).toISOString() 
  };
};
dailyGoalsModel.get = function() {
  var date = new Date(calendarInline.value[0] || Date.now());
  
  return Object.assign({}, this, {goals:this.goals.filter(function(goal) {
    var gdate = new Date(goal.date);

    return gdate.getMonth() == date.getMonth()
      && gdate.getFullYear() == date.getFullYear()
      && gdate.getDate() == date.getDate();
  })})
};

models = {
  goals: goalsModel,
  mgoals: monthlyGoalsModel,
  dgoals: dailyGoalsModel
};


function loadModel(name, defaultValue) {
  return JSON.parse(localStorage.getItem(name)) || defaultValue;
}

function saveModel(name, model) {
  localStorage.setItem(name, JSON.stringify(model || models[name]));
}

var templates = {};

function sync(templateName, context) {
  var template = templates[templateName] || $$(templateName).html();
  templates[templateName] = template;
  $$(templateName).html(Template7.compile(template)(context.get()));
}

sync("#goalsTemplate", goalsModel);
sync("#mgoalsTemplate", monthlyGoalsModel);
sync("#dgoalsTemplate", dailyGoalsModel);
 
// Add view
var mainView = myApp.addView('.view-main', {
  // Because we want to use dynamic navbar, we need to enable it for this view:
  dynamicNavbar: true
});

var mySwiper = myApp.swiper('.swiper-container', {
  spaceBetween: 100
});


// GOALS

var isEditingGoals = {};
var links = {};

function toggleGoalsLinks(type) {  
  var link = $$('.select-'+type+'-link');

  if (isEditingGoals[type]) {
    links[type] = link.attr('href');
    link.attr('href', '#');
  } else {
    link.attr('href', links[type]);
  }
}

function editGoals(type, cb) {
  $$("."+type+"s-slide .editing").toggleClass("hidden");
  isEditingGoals[type] = !isEditingGoals[type];
  toggleGoalsLinks(type);
  toggleInputs(type, cb);

}

function toggleInputs(type, cb) {
  $$(".select-"+type+"-link .item-title").each(function() {
    if (isEditingGoals[type]) {
      this.innerHTML = "<input type='text' value='"+this.textContent.trim()+"'>"
    } else {
      var value = (this.childNodes[0].value || "").trim();
      this.innerHTML = value;
      cb($$(this).parents("[data-id]").data("id"), value);
    }
  });
}

$$('#changeGoalsBtn').click(function() { editGoals('goal', updateTitle.bind(goalsModel, "goals")); });
$$('#changeMonthlyGoalsBtn').click(function () { editGoals('monthly-goal', updateTitle.bind(monthlyGoalsModel, 'mgoals')); });
$$('#changeDailyGoalsBtn').click(function () { editGoals('daily-goal', updateTitle.bind(dailyGoalsModel, 'dgoals')); });

function updateTitle(type, id, newTitle) {
  this.goals.forEach(function(goal) {
    goal.title = goal.id == id ? newTitle : goal.title; 
  });

  saveModel(type, this);
}

function deleteGoal(evt, type, model) {
  myApp.confirm("Вы уверены?", "Удаление цели", function() {
    var link = $$(evt.target).parents("[data-id]");
    var targetId = link.data('id');
    link.remove(true);
    model.goals.splice.apply(model.goals, [0, model.goals.length].concat(model.goals.filter(function(goal) {return goal.id != targetId})));
    saveModel(type, model);
  });
}

function subsDeletion(type) {
  $$('#'+type+'Template .deleteBtn').on("click", function(evt) { deleteGoal(evt, type, goalsModel)});  
}

subsDeletion("goals");
subsDeletion("mgoals");
subsDeletion("dgoals");


function addGoal(type, type2, model) {
  model.goals.push(model.new());
  saveModel(type+"s", model);
  sync("#"+type+"sTemplate", model);
  subsDeletion(type+"s");
  subsSelection(type, model);
  $$("."+type2+"s-slide .editing").removeClass("hidden");
  toggleGoalsLinks(type2);
  toggleInputs(type2);
}


$$('.addGoalBtn').on('click', function() { addGoal("goal", "goal", goalsModel)});
$$('.addMonthlyGoalBtn').on('click', function() { addGoal("mgoal", "monthly-goal", monthlyGoalsModel)});
$$('.addDailyGoalBtn').on('click', function() { addGoal("dgoal", "daily-goal", dailyGoalsModel)});

function selectGoal(evt, type, model) {
  var id = $$(evt.target).parents('[data-id]').data("id");
  myApp.template7Data['page:'+type] = model.goals
    .filter(function(goal) { return goal.id == id })
    .pop();
}

function subsSelection(type, model) {
  $$("#"+type+"sTemplate .item-link").on("click", function(evt) { selectGoal(evt, type, model)});
}

subsSelection('goal', goalsModel);
subsSelection('mgoal', monthlyGoalsModel);
subsSelection('dgoal', dailyGoalsModel);



$$('body').on("click", '.edit-goal-desc', function() {
  var descInput = $$('.goal-desc');
  descInput[0].contentEditable = true;
  descInput.focus();

  $$('.save-goal-desc').removeClass('hidden');
  $$(this).addClass('hidden');
});

$$('body').on("click", '.save-goal-desc', function() {
  var descInput = $$('.goal-desc');
  descInput[0].contentEditable = false;
  var goalType = $$('.page:last-child').data('page');
  myApp.template7Data['page:'+goalType].description = descInput.text();
  saveModel(goalType+"s");

  $$(this).addClass('hidden');
  $$('.edit-goal-desc').removeClass('hidden');
});

$$('body').on("click", '.open-gallery', function() {
  myApp.popup(".popup-gallery");
});

$$('body').on("click", '.f7-demo-icon-cell', function(evt) {
  var icon = evt.target.textContent.trim()
  var goalType = $$('.page:last-child').data('page');
  myApp.template7Data['page:'+goalType].icon = icon;
  saveModel(goalType+"s");
  sync("#"+goalType+"sTemplate", models[goalType+"s"]);
  subsDeletion(goalType+"s");
  subsSelection(goalType, models[goalType+"s"]);
  $$('.open-gallery .f7-icons').text(icon);
  myApp.closeModal('.popup-gallery');
});