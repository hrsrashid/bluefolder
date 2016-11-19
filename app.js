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
    {id: 1, title: "Цель на месяц 1", description: "Описание 1"},
    {id: 2, title: "Цель на месяц 2", description: "Описание 2"}
  ]
});

var dailyGoalsModel = loadModel('dgoals', {
  _ai: 3,
  goals: [
    {id: 1, title: "Цель на день 1", description: "Описание д1"},
    {id: 2, title: "Цель на день 2", description: "Описание д2"}
  ]
});


function loadModel(name, defaultValue) {
  return JSON.parse(localStorage.getItem(name)) || defaultValue;
}

function saveModel(name, model) {
  localStorage.setItem(name, JSON.stringify(model));
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

function editGoals(type) {
  $$("."+type+"s-slide .editing").toggleClass("hidden");
  isEditingGoals[type] = !isEditingGoals[type];
  toggleGoalsLinks(type);
}

$$('#changeGoalsBtn').click(function() { editGoals('goal'); });
$$('#changeMonthlyGoalsBtn').click(function () { editGoals('monthly-goal'); });
$$('#changeDailyGoalsBtn').click(function () { editGoals('daily-goal'); });

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
}


$$('.addGoalBtn').on('click', function() { addGoal("goal", "goal", goalsModel, "Новая цель")});
$$('.addMonthlyGoalBtn').on('click', function() { addGoal("mgoal", "monthly-goal", monthlyGoalsModel, "Новая месячная цель")});
$$('.adddailyGoalBtn').on('click', function() { addGoal("dgoal", "daily-goal", dailyGoalsModel, "Новая дневная цель")});

function selectGoal(evt, type, model) {
  var id = $$(evt.target).parents('[data-id]').data("id");
  myApp.template7Data['page:'+type] = model.goals
    .filter(function(goal) { return goal.id == id })
    .pop();
}

function subsSelection(type) {
  $$(".select-"+type+"-link").on("click", function(evt) { selectGoal(evt, type, goalsModel)});
}

subsSelection('goal');
subsSelection('mgoal');
subsSelection('dgoal');





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