# mdcalendar
MDCalendar - independent plugin for creating calendar. You can select days, can click on month name in calendar header and choise month or click on year and choose any year

For initializing calendar you have to call MDCalendar function with following parameters:
  - selector - string. Selector has to de like in jQuery ('.some_class', '#some_id' or 'element_tag'), except multiselectors
  - options - object. Collection of different parameters and callback functions

  In 'options' available the following parameters:
        - prefix  : 'md_',    // prefix before each class
        - first   : 0,        // First day in week. 0 - Sunday, 1 - Monday
        - lang    : {         // localization
            month   : "Month",
            months  : "Months",
            day     : "Day",
            days    : "Days",
            year    : "Year",
            years   : "Years",
            days_of     : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
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

  Example DOM:
      <div id="div_block1">Clendar block</div>

  Example script:
      MDCalendar('#div_block1', {
                first : 1,
                lang : {
                    month   : "Місяць",
                    months  : "місяці",
                    day     : "день",
                    days    : "дні",
                    year    : "рік",
                    years   : "роки",
                    days_of     : ['неділя', 'понеділок', 'вівторок', 'середа', 'четверг', 'п\'ятниця', 'субота'],
                    daysMin     : ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
                    months_of   : ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень']
                }
            });

Thanks for using:)