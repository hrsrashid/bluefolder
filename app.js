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
    {id: 1, title: "Задача на месяц 1", description: "Описание 1"},
    {id: 2, title: "Задача на месяц 2", description: "Описание 2"}
  ]
});

var dailyGoalsModel = loadModel('dgoals', {
  _ai: 3,
  goals: [
    {id: 1, title: "Дело на день 1", description: "Описание д1"},
    {id: 2, title: "Дело на день 2", description: "Описание д2"}
  ]
});

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
 
// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var templates = {};

function sync(templateName, context) {
  var template = templates[templateName] || $$(templateName).html();
  templates[templateName] = template;
  $$(templateName).html(Template7.compile(template)(context));
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
      var value = this.childNodes[0].value.trim();
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


function addGoal(type, type2, model, msg) {
  var newid = model._ai++;
  model.goals.push({id: newid, title: msg});
  saveModel(type+"s", model);
  sync("#"+type+"sTemplate", model);
  subsDeletion(type+"s");
  subsSelection(type);
  $$("."+type2+"s-slide .editing").removeClass("hidden");
  toggleGoalsLinks(type2);
  toggleInputs(type2);
}


$$('.addGoalBtn').on('click', function() { addGoal("goal", "goal", goalsModel, "Новая цель")});
$$('.addMonthlyGoalBtn').on('click', function() { addGoal("mgoal", "monthly-goal", monthlyGoalsModel, "Новая месячная задача")});
$$('.adddailyGoalBtn').on('click', function() { addGoal("dgoal", "daily-goal", dailyGoalsModel, "Новое дневное дело")});

function selectGoal(evt, type, model) {
  var id = $$(evt.target).parents('[data-id]').data("id");
  myApp.template7Data['page:'+type] = model.goals
    .filter(function(goal) { return goal.id == id })
    .pop();
}

function subsSelection(type, type2, model) {
  $$(".select-"+type2+"-link").on("click", function(evt) { selectGoal(evt, type, model)});
}

subsSelection('goal', 'goal', goalsModel);
subsSelection('mgoal', 'monthly-goal', monthlyGoalsModel);
subsSelection('dgoal', 'daily-goal', dailyGoalsModel);





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
    }
});

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