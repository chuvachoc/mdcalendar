# mdcalendar
MDCalendar - independent plugin for creating calendar. You can select days, can click on month name in calendar header and choise month or click on year and choose any year.

For initializing calendar you have to call MDCalendar function with next parameters:
  - selector - string. Selector has to de like in jQuery ('.some_class', '#some_id' or 'element_tag'), except multiselectors
  - options - object. Collection of different parameters and callback functions

  In 'options' available next parameters:
    - prefix  : 'md_',    // prefix before each class
    - first   : 0,        // First day in week. 0 - Sunday, 1 - Monday
    - lang    : {         // locazation
        month   : "Month",
        months  : "Months",
        day     : "Day",
        days    : "Days",
        year    : "Year",
        years   : "Years",
        ays_of     : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        daysMin     : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        months_of   : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    },
    - draw_year   : function(elem){},     // calls after each call to draw cell of year.    elem - pointer on years block after created
    - draw_month  : function(elem){},     // after each call to draw cell of month  elem - pointer on months block after created
    - draw_day    : function(elem){},     // after each call to draw cell of day    elem - pointer on days block  after created
    - init        : function(elem){},     // after initialize calendar  elem - pointer on calendar after created
    - select      : function(elem){},     // after select the day   elem - pointer on select block after click
    - change      : function(elem, type){},     // after each change in calendar (just structure changes).   elem - pointer on some elements, type - type of change

  Types of change function :
    - created_wrapper
    - change_date
    - select_years_page
    - select_months_page
    - select_days_page
    - select_month
    - select_year
    - select_day

  All parameters in 'options' array is not important and can be skipped.

  Function: MDCalendar( string : selector, [object : options] )

Thanks for using:) 
