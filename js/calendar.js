/**
 * Created by Denys on 13.02.2016.
 *
 * MDCalendar - independent plugin for creating calendar.
 *
 * For initializing calendar you have to call MDCalendar function with next parameters:
 *  - selector - string. Selector has to de like in jQuery ('.some_class', '#some_id' or 'element_tag'), except multiselectors
 *  - options - object. Collection of different parameters and callback functions
 *
 *  In 'options' available next parameters:
 *      - prefix  : 'md_',    // prefix before each class
        - first   : 0,        // First day in week. 0 - Sunday, 1 - Monday
        - lang    : {         // locazation
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
 */


;(function (win, doc) {

    /**
     * Checks all custom options from user. If some options is undefined - set default option from Calendar.options
     * @param options - has object type. See more in Calendar.options;
     * @returns {}
     */
    function checkOptions(options){
        var options = options || {};

        for(var key in MDCalendar.options){
            if(key == 'lang' || key in options) continue;
            options[key] = MDCalendar.options[key];
        }

        options.lang = options.lang || {}
        for(var key in MDCalendar.options.lang){
            if(key == 'days_of' || key == 'daysMin' || key == 'months_of' || key in options.lang) continue;
            options.lang[key] = MDCalendar.options.lang[key];
        }

        if(!options.lang.days_of || typeof options.lang.days_of != 'object') {
            options.lang.days_of = new Array();
            for(var key in MDCalendar.options.lang.days_of) options.lang.days_of[key] = MDCalendar.options.lang.days_of[key];
        }
        else for(var i = options.lang.days_of.length; i < 7; ++i) options.lang.days_of[i] = "";

        if(!options.lang.daysMin || typeof options.lang.daysMin != 'object') {
            options.lang.daysMin = new Array();
            for(var key in MDCalendar.options.lang.daysMin) options.lang.daysMin[key] = MDCalendar.options.lang.daysMin[key];
        }
        else for(var i = options.lang.daysMin.length; i < 7; ++i) options.lang.daysMin[i] = "";


        if(!options.lang.months_of || typeof options.lang.months_of != 'object') {
            options.lang.months_of = new Array();
            for(var key in MDCalendar.options.lang.months_of) options.lang.months_of[key] = MDCalendar.options.lang.months_of[key];
        }
        else for(var i = options.lang.months_of.length; i < 12; ++i) options.lang.months_of[i] = "";

        return options;
    }

    /**
     * This function parse selector string. The string format has to de like in jQuery ('.some_class', '#some_id' or 'element_tag'), except multiselector
     * @param selector - string
     * @returns {*}
     */
    function parseSelector(selector){
        if(!selector || selector.length < 2) return null;

        var f = selector[0],
            result = {
                attr : 'tagName',
                selector : selector,
                func : function(val){
                    if(!val) return false;
                    var s = selector;
                    return val.toUpperCase() == s.toUpperCase();
                }
            };

        if(f == '.'){
            result.attr = 'className';
            result.selector = selector.substring(1);
            result.func = function (val) {
                if(!val) return false;
                var s = this.selector.toUpperCase(),
                    val = val.toUpperCase();

                return val.indexOf(s) >= 0 ? true : false;
            }
        }
        else if(f == '#'){
            result.attr = 'id';
            result.selector = selector.substring(1);
            result.func = function (val) {
                if(!val) return false;
                var s = this.selector.toUpperCase(),
                    val = val.toUpperCase();

                return val.indexOf(s) >= 0 ? true : false;
            }
        }

        return result;
    }

    /**
     * Selecting element or elements from DOM by selector (selector type like in jQuery, except multiselector)
     * @param selector - string ('.element_class', '#element_id' or 'element_tag')
     * @returns {{}}
     */
    function getSelectObjects(selector){
        if(!selector || selector.length < 2) return { type : 'array', elem : [] }

        var f = selector[0],
            result = {
                type : 'array',
                elem : []
            };

        if(f == "."){   // by class
            result.elem = doc.getElementsByClassName(selector.substring(1));
        }
        else if(f == '#'){  // by id
            result.type = 'object';
            result.elem = doc.getElementById(selector.substring(1));
        }
        else {
            result.elem = doc.getElementsByTagName(selector);
        }

        return result;
    }

    /**
     * Creates wrapper for calendar in elem
     * @param elem - pointer on DOM element
     */
    function createWrapper(elem){
        var options = elem.custom_options,
            prefix = options.prefix;

        // creating HTML for differents parts
        var wrapper_s = '<div class="'+prefix+'calendar_wrapper">',
            wrapper_e = '</div>',
            header = '<div class="'+prefix+'calendar_header">'+
                '<div id="'+prefix+'to_left" class="'+prefix+'header_part"><</div>'+
                '<div id="'+prefix+'header_center" class="'+prefix+'header_part">'+
                    '<span id="'+prefix+'header_date" class="'+prefix+'header_center"></span>'+
                    '<span id="'+prefix+'header_month" class="'+prefix+'header_center"></span>'+
                    '<span id="'+prefix+'header_year" class="'+prefix+'header_center"></span></div>'+
                '<div id="'+prefix+'to_right" class="'+prefix+'header_part">></div></div>',
            body_s = '<div class="'+prefix+'calendar_body">',
            bode_e = '</div>',
            footer = '<div class="'+prefix+'calendar_footer">by Mykhajlyshen Denys</div>';

        /*<ul>'+
         '<li id="'+prefix+'to_years">'+options.lang.years+'</li>'+
         '<li id="'+prefix+'to_months">'+options.lang.months+'</li>'+
         '<li id="'+prefix+'to_days">'+options.lang.days+'</li>'+
         '</ul>*/

        // body content
        var years = '<div class="'+prefix+'cal_ypart"></div>',
            months = '<div class="'+prefix+'cal_mpart"></div>',
            days = [ '<div class="'+prefix+'cal_dpart '+prefix+'cal_select_page"><div class="dpart_header">', '</div><div id="dpart_body" class="dpart_body"></div></div>' ];

        var days_header = '',
            i = options.first,
            j = 0;
        while(i < options.lang.daysMin.length){
            days_header += '<div id="'+prefix+'days_header_'+j+'" class="days_header_cell">'+options.lang.daysMin[i]+'</div>';
            ++i; ++j;
        }
        if(options.first > 0) days_header += '<div id="'+prefix+'days_header_'+j+'" class="days_header_cell">'+options.lang.daysMin[0]+'</div>';

        days = days[0]+days_header+days[1];

        // build
        elem.innerHTML = wrapper_s + header + body_s + years + months + days + bode_e + footer + wrapper_e;

        options.change(elem, 'created_wrapper');
    }

    /**
     * Get number of days in month
     * @param month
     * @param year
     * @returns {number} - integer 28 - 31
     */
    function getCountDaysInMonth(month, year){
        var cur_date = new Date();
        var month = parseInt(month),// ? parseInt(month) : cur_date.getMonth(),
            year = parseInt(year); // ?  || cur_date.getFullYear();

        month = !isNaN(month) ? month : cur_date.getMonth();
        year = !isNaN(year) ? year : cur_date.getFullYear();

        if(month < 0 || month > 11) month = cur_date.getMonth();
        if(year < 1970 || year > 3000) year = cur_date.getFullYear();

        if(month == 11){
            month = 0;
            ++year;
        }
        else ++month;

        date = new Date(year, month, 0, 0, 0, 0, 0)
        return date.getDate();
    }

    /**
     *  Creates DIV element
     * @param text - some text
     * @param d_type - type of day. Default - null. 'today' - if this day is current
     * @param type - type of cell. 'cur' - default value. 'prev' - cell for previous month, 'next' - cell for next month, 'cur' - cell for current month
     */
    function createDay(text, date, month, year, type, d_type){
        var text = text || '',
            type = type || 'cur',
            d_type = d_type || null,
            options = this.custom_options;

        var div = doc.createElement('div');
        var _class = options.prefix+"day_btn "+options.prefix+type+"_month_day";
        if(d_type !== null) _class += " "+options.prefix+"date_today";
        div.className = _class;
        div.id = "date_"+date+"_"+month;
        div.innerHTML = text;
        var data = { date : date, month : month, year : year };
        Object.defineProperty(div, 'cell_data', { value : data, enumerable : false});
        this.extend(div, this);
        this.superclass.bindDayButton(div);

        return div;
    }

    /**
     * Search function like in jQuery
     * @param selector - like in jQuery
     * @returns {Array}
     */
    function find(selector){
        var selector = this.superclass.parseSelector(selector);

        var result = new Array();

        function _f(elem){
            if(selector.func(elem[ selector.attr ])) result.push(elem);

            if(elem.childNodes.length == 0) return;

            for(var i = 0; i < elem.childNodes.length; ++i)
                _f(elem.childNodes[i]);
        }

        _f(this);

        return result;
    }

    function changeHeaderDate(date, month, year){
        var _this = this;

        _this.find('#md_header_date')[0].innerHTML = date;
        _this.find('#md_header_month')[0].innerHTML = _this.custom_options.lang.months_of[month];
        _this.find('#md_header_year')[0].innerHTML = year;

        _this.custom_options.change(_this, 'change_date');
    }

    /**
     * Draws cells for days of month in calendar
     * @param month - integer 0-11. Default - current month
     * @param year - integer. Default - current year
     */
    function drawDaysOfMonth(month, year){
        var cur_date = new Date(),
            _this = this,
            month = parseInt(month),
            year = parseInt(year);

        if(isNaN(month) || month < 0 || month > 11) month = cur_date.getMonth();
        if(isNaN(year) || year < 1970 || year > 3000) year = cur_date.getFullYear();

        var prev_month = month - 1,
            prev_year = year,
            next_month = month + 1,
            next_year = year;

        if(prev_month < 0){
            prev_month = 11;
            --prev_year;
        }
        if(next_month > 11){
            next_month = 0;
            ++next_year;
        }

        var dcount = _this.getCountDaysInMonth(month, year),
            prev_dcount = _this.getCountDaysInMonth(prev_month, prev_year);

        var date = new Date(year, month, 1, 0, 0, 0, 0),
            f_day = date.getDay();  // first day in this month

        date = new Date(next_year, next_month, 0, 0, 0, 0, 0);
        var l_day = date.getDay();  // last day in this month

        if(_this.custom_options.first > 0){
            f_day = f_day > 0 ? --f_day : 6;
            l_day = l_day > 0 ? --l_day : 6;
        }

        var days_body = _this.find('#dpart_body');
        if(days_body.length == 0) return;
        days_body = days_body[0];
        days_body.innerHTML = "";

        f_day = f_day == 0 ? 7 : f_day;
        for(var prev_start = prev_dcount - f_day + 1; prev_start <= prev_dcount; ++prev_start){
            var day = _this.createDay(prev_start, prev_start, prev_month, prev_year, 'prev');
            days_body.appendChild(day);
            _this.custom_options.draw_day(day);
        }
        for(var i = 1; i <= dcount; ++i){
            var d_type = null;
            if(i == cur_date.getDate() && year == cur_date.getFullYear() && month == cur_date.getMonth()) d_type = 'today';
            var day = _this.createDay(i, i, month, year, 'cur', d_type);
            days_body.appendChild(_this.createDay(i, i, month, year, 'cur', d_type));
            _this.custom_options.draw_day(day);
        }
        var child = days_body.childElementCount;
        for(i = 1; i+child <= 42; ++i){
            var day = _this.createDay(i, i, next_month, next_year, 'next');
            days_body.appendChild(day);
            _this.custom_options.draw_day(day);
        }
    }

    function drawMonths(year){
        var options = this.custom_options,
            _this = this.find('.'+options.prefix+'cal_mpart'),
            __this = this,
            cur_date = new Date(),
            year = year !== undefined && year > 0 && year < 3000 ? year : cur_date.getFullYear();

        if(_this.length == 0) return;
        _this = _this[0];
        _this.innerHTML = "";

        for(var key in options.lang.months_of){
            var div = doc.createElement('div');
            div.className = options.prefix+"month_btn";
            if(key == cur_date.getMonth() && year == cur_date.getFullYear()) div.className += " "+options.prefix+"current_month";
            div.innerHTML = options.lang.months_of[key];
            var val = { year : year, month : key };
            Object.defineProperty(div, 'cell_data', { value : val, enumerable : false });
            div.id = 'month_'+key+"_"+year;
            __this.extend(div, __this);
            div.superclass.bindMonthButton(div);
            _this.appendChild(div);
            options.draw_month(div);
        }

    }

    function drawYears(){
        var options = this.custom_options,
            _this = this.find('.'+options.prefix+'cal_ypart'),
            __this = this,
            cur_date = new Date();

        if(_this.length == 0) return;
        _this = _this[0];

        this.extend(_this, this);

        var cur_year = cur_date.getFullYear();

        for(var i = cur_date.getFullYear() - 5; i <= cur_year+5; ++i){
            var div = doc.createElement('div');
            div.className = options.prefix+"year_btn";
            if(i == cur_year) div.className += " "+options.prefix+"current_year";
            div.innerHTML = i;
            div.id = "year_"+i;
            var val = { year : i };
            Object.defineProperty(div, 'cell_data', { value : val, enumerable : false });
            __this.extend(div, __this);
            div.superclass.bindYearButton(div);
            _this.appendChild(div);
            options.draw_year(div);
        }

    }


    // Functions for showing years page, months page or days
    function showYears(){
        var md_cal_ypart = this.find('.'+this.custom_options.prefix+'cal_select_page'),
            _this = this;
        if(md_cal_ypart.length > 0) {
            md_cal_ypart = md_cal_ypart[0];
            md_cal_ypart.className = md_cal_ypart.className.replace(" "+_this.custom_options.prefix+"cal_select_page", "").replace(_this.custom_options.prefix+"cal_select_page", "");
        }

        var md_cal_ypart = this.find('.'+this.custom_options.prefix+'cal_ypart');
        if(md_cal_ypart.length == 0) return;
        md_cal_ypart = md_cal_ypart[0];
        md_cal_ypart.className += " "+_this.custom_options.prefix+"cal_select_page";

        _this.custom_options.change(md_cal_ypart, 'select_years_page');
    }

    function showMonths(){
        var md_cal_ypart = this.find('.'+this.custom_options.prefix+'cal_select_page'),
            _this = this;
        if(md_cal_ypart.length > 0) {
            md_cal_ypart = md_cal_ypart[0];
            md_cal_ypart.className = md_cal_ypart.className.replace(" "+_this.custom_options.prefix+"cal_select_page", "").replace(_this.custom_options.prefix+"cal_select_page", "");
        }

        var md_cal_ypart = this.find('.'+this.custom_options.prefix+'cal_mpart');
        if(md_cal_ypart.length == 0) return;
        md_cal_ypart = md_cal_ypart[0];
        md_cal_ypart.className += " "+_this.custom_options.prefix+"cal_select_page";

        _this.custom_options.change(md_cal_ypart, 'select_months_page');
    }

    function showDays(){
        var md_cal_ypart = this.find('.'+this.custom_options.prefix+'cal_select_page'),
            _this = this;
        if(md_cal_ypart.length > 0) {
            md_cal_ypart = md_cal_ypart[0];
            md_cal_ypart.className = md_cal_ypart.className.replace(" "+_this.custom_options.prefix+"cal_select_page", "").replace(_this.custom_options.prefix+"cal_select_page", "");
        }

        var md_cal_ypart = this.find('.'+this.custom_options.prefix+'cal_dpart');
        if(md_cal_ypart.length == 0) return;
        md_cal_ypart = md_cal_ypart[0];
        md_cal_ypart.className += " "+_this.custom_options.prefix+"cal_select_page";

        _this.custom_options.change(md_cal_ypart, 'select_days_page');
    }

    // Functions for operations with Months
    function nextMonth(){
        var _this = this.superclass,
            cal_date = _this.current_date;

        var month = cal_date.month,
            year = cal_date.year;

        month++;
        if(month > 11){
            month = 0;
            year++;
        }

        _this.selectMonth(year, month);
    }

    function prevMonth(){
        var _this = this.superclass,
            cal_date = _this.current_date;

        var month = cal_date.month,
            year = cal_date.year;

        month--;
        if(month < 0){
            month = 11;
            year--;
        }

        _this.selectMonth(year, month);
    }

    function selectMonth(year, month){
        var _this = this.superclass,
            cal_date = _this.current_date;

        var year = year !== undefined && year >= 1970 && year <= 3000 ? year : null,
            month = month !== undefined && month >= 0 && month <= 11 ? month : null;

        if(year === null || month === null) return;

        var redraw = false,
            redraw_month = false;
        if(month != cal_date.month || year != cal_date.year) redraw = true;
        if(year != cal_date.year) redraw_month = true;

        cal_date.month = month;
        cal_date.year = year;

        var day = _this.find("."+_this.custom_options.prefix+"select_month");
        if(day.length > 0) {
            day = day[0];
            day.className = day.className.replace(" "+_this.custom_options.prefix+"select_month", "").replace(_this.custom_options.prefix+"select_month", "");
        }

        var day = _this.find('#month_'+month+'_'+year);
        if(day.length > 0) {
            day = day[0];
            day.className += " "+_this.custom_options.prefix+"select_month";
        }

        var date = new Date();
        date = date.getMonth() == month && date.getFullYear() == year ? date.getDate() : 1;

        if(redraw)_this.drawDaysOfMonth(cal_date.month, cal_date.year);
        if(redraw_month){
            _this.selectYear(cal_date.year);
            _this.drawMonths(cal_date.year);
        }
        _this.custom_options.change(day, 'select_month');
        _this.selectDay(date, month, year);
        _this.showDays();
    }

    // Functions for operations with Years
    function nextYear(){
        var _this = this.superclass,
            cal_date = _this.current_date;

        var year = cal_date.year;

        year++;
        if(year > 3000){
            year = 3000;
        }

        _this.drawDaysOfMonth(cal_date.month, cal_date.year);
    }

    function prevYear(){
        var _this = this.superclass,
            cal_date = _this.current_date;

        var year = cal_date.year;

        year--;
        if(year < 1970){
            year = 1970;
        }

        _this.drawDaysOfMonth(cal_date.month, cal_date.year);
    }

    function selectYear(year){
        var _this = this.superclass,
            cal_date = _this.current_date;

        var year = year !== undefined && year >= 1970 && year <= 3000 ? year : null;

        if(year === null) return;

        var redraw = false;
        if(year !== cal_date.year) redraw = true;

        cal_date.year = year;

        var day = _this.find("."+_this.custom_options.prefix+"select_year");
        if(day.length > 0) {
            day = day[0];
            day.className = day.className.replace(" "+_this.custom_options.prefix+"select_year", "").replace(_this.custom_options.prefix+"select_year", "");
        }

        var day = _this.find('#year_'+year);
        if(day.length > 0) {
            day = day[0];
            day.className += " "+_this.custom_options.prefix+"select_year";
        }


        if(redraw){
            _this.drawMonths(year);
            _this.drawDaysOfMonth(cal_date.month, cal_date.year);
        }
        _this.custom_options.change(day, 'select_year');
        _this.selectMonth(year, cal_date.month);
        _this.showDays();
    }

    // Functions for operations with Days
    function nextDay(){
        var _this = this.superclass,
            cal_date = _this.current_date;

        var count_days = _this.getCountDaysInMonth(cal_date.month, cal_date.year);

        var day = cal_date.day,
            month = cal_date.month,
            year = cal_date.year;

        day++;
        if(day > count_days){
            day = 1;
            month++;
            if(month > 11){
                month = 0;
                year++;
            }
        }

        _this.selectDay(day, month, year);
    }

    function prevDay(){
        var _this = this.superclass,
            cal_date = _this.current_date,
            prev_month = cal_date.month - 1,
            prev_year = cal_date.year;


        if(prev_month < 0){
            prev_month = 11;
            --prev_year;
        }

        var count_days = _this.getCountDaysInMonth(prev_month, prev_year);

        var day = cal_date.day,
            month = cal_date.month,
            year = cal_date.year;

        day--;
        if(day < 1){
            day = count_days;
            month--;
            if(month < 0){
                month = 11;
                year--;
                year = year < 1970 ? 1970 : year;
            }
        }

        _this.selectDay(day, month, year);
    }

    function selectDay(date, month, year){
        var _this = this.superclass,
            cal_date = _this.current_date;

        if(cal_date.month != month || cal_date.year != year){
            _this.drawDaysOfMonth(month, year);
        }

        cal_date.day = date;
        cal_date.month = month;
        cal_date.year = year;

        var day = _this.find("."+_this.custom_options.prefix+"select_day");
        if(day.length > 0) {
            day = day[0];
            day.className = day.className.replace(" "+_this.custom_options.prefix+"select_day", "").replace(_this.custom_options.prefix+"select_day", "");
        }

        var day = _this.find('#date_'+date+'_'+month);
        if(day.length == 0) return;
        day = day[0];
        day.className += " "+_this.custom_options.prefix+"select_day";

        _this.changeHeaderDate(date, month, year);
        _this.showDays();

        _this.custom_options.select(day);
        _this.custom_options.change(day, 'select_day');
    }


    function bindWrapper(elem){
        var options = elem.custom_options,
            prefix = options.prefix;

        var to_left = elem.find('#'+prefix+'to_left')[0],
            to_right = elem.find('#'+prefix+'to_right')[0],
            header_date = elem.find('#'+prefix+'header_date')[0],
            header_month = elem.find('#'+prefix+'header_month')[0],
            header_year = elem.find('#'+prefix+'header_year')[0],
            to_years = elem.find('#'+prefix+'to_years')[0],
            to_months = elem.find('#'+prefix+'to_months')[0],
            to_days = elem.find('#'+prefix+'to_days')[0];

        to_left.onclick = function(){ elem.prevMonth(); }
        to_right.onclick = function(){ elem.nextMonth(); }
        header_date.onclick = function(){ elem.showDays(); }
        header_month.onclick = function(){ elem.showMonths(); }
        header_year.onclick = function(){ elem.showYears(); }
    }

    function bindDayButton(cell_elem){
        cell_elem.onclick = function () {
            var _this = this.superclass,
                data = this.cell_data;

            _this.selectDay(data.date, data.month, data.year);
        }
    }

    function bindMonthButton(cell_elem){
        cell_elem.onclick = function () {
            var data = this.cell_data;

            this.superclass.selectMonth(data.year, data.month);
        }
    }

    function bindYearButton(cell_elem){
        cell_elem.onclick = function () {
            var _this = this.superclass,
                data = this.cell_data;

            _this.selectYear(data.year);
        }
    }

    function extend(child, parent){
        var sub_obj = true;

        if(!parent){
            sub_obj = false;
            var parent = child;
        }
        Object.defineProperty(child, 'superclass', { value : parent, writable : false, configurable : false, enumerable : false });
        Object.defineProperty(child, 'extend', { value : extend, writable : false, configurable : false, enumerable : false });
        Object.defineProperty(child, 'find', { value : find, writable : false, configurable : false, enumerable : false });

        if(!sub_obj){
            Object.defineProperty(child, 'getCountDaysInMonth', { value : getCountDaysInMonth, writable : false, configurable : false, enumerable : false });
            Object.defineProperty(child, 'drawDaysOfMonth', { value : drawDaysOfMonth, writable : false, configurable : false, enumerable : false });
            Object.defineProperty(child, 'drawMonths', { value : drawMonths, writable : false, configurable : false, enumerable : false });
            Object.defineProperty(child, 'drawYears', { value : drawYears, writable : false, configurable : false, enumerable : false });
            Object.defineProperty(child, 'createDay', { value : createDay, writable : false, configurable : false, enumerable : false });
            Object.defineProperty(child, 'parseSelector', { value : parseSelector, writable : false, configurable : false, enumerable : false });
            Object.defineProperty(child, 'bindDayButton', { value : bindDayButton, writable : false, configurable : false, enumerable : false });
            Object.defineProperty(child, 'bindMonthButton', { value : bindMonthButton, writable : false, configurable : false, enumerable : false });
            Object.defineProperty(child, 'bindYearButton', { value : bindYearButton, writable : false, configurable : false, enumerable : false });
            Object.defineProperty(child, 'changeHeaderDate', { value : changeHeaderDate, writable : false, configurable : false, enumerable : false });

            Object.defineProperty(child, 'showYears', { value : showYears, writable : false, configurable : false, enumerable : false });
            Object.defineProperty(child, 'showMonths', { value : showMonths, writable : false, configurable : false, enumerable : false });
            Object.defineProperty(child, 'showDays', { value : showDays, writable : false, configurable : false, enumerable : false });

            Object.defineProperty(child, 'nextMonth', { value : nextMonth, writable : false, configurable : false, enumerable : false });
            Object.defineProperty(child, 'prevMonth', { value : prevMonth, writable : false, configurable : false, enumerable : false });
            Object.defineProperty(child, 'selectMonth', { value : selectMonth, writable : false, configurable : false, enumerable : false });

            Object.defineProperty(child, 'nextYear', { value : nextYear, writable : false, configurable : false, enumerable : false });
            Object.defineProperty(child, 'prevYear', { value : prevYear, writable : false, configurable : false, enumerable : false });
            Object.defineProperty(child, 'selectYear', { value : selectYear, writable : false, configurable : false, enumerable : false });

            Object.defineProperty(child, 'nextDay', { value : nextDay, writable : false, configurable : false, enumerable : false });
            Object.defineProperty(child, 'prevDay', { value : prevDay, writable : false, configurable : false, enumerable : false });
            Object.defineProperty(child, 'selectDay', { value : selectDay, writable : false, configurable : false, enumerable : false });
        }

    }

    function init(elem, options){
        if(elem.MDCalendar === true) return;
        Object.defineProperty(elem, 'MDCalendar', { value : true, enumerable : false });
        Object.defineProperty(elem, 'custom_options', { value : options, enumerable : false });
        extend(elem);

        var date = new Date();
        date = {
            year : date.getFullYear(),
            month : date.getMonth(),
            day : date.getDate(),
        }
        Object.defineProperty(elem, 'current_date', { value : date, enumerable : false });


        createWrapper(elem);
        bindWrapper(elem);
        var date = new Date();
        elem.drawDaysOfMonth();
        elem.drawMonths();
        elem.drawYears();
        elem.selectYear(date.getFullYear());

        options.init(elem);
    }

    var MDCalendar = function (selector, options) {
        if(!selector) return undefined;
        var options = checkOptions(options);

        var objects = getSelectObjects(selector);

        if(objects.type == 'array'){
            for(var i = 0; i < objects.elem.length; ++i) init(objects.elem[i], options);
        }
        else init(objects.elem, options);

        return objects.elem;
    }

    MDCalendar.options = {
        prefix  : 'md_',    // prefix before each class
        first   : 0,        // 0 - Sunday, 1 - Monday
        lang    : {         // locazation
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
        draw_year   : function(){},     // after each call to draw cell of year
        draw_month  : function(){},     // after each call to draw cell of month
        draw_day    : function(){},     // after each call to draw cell of day
        init        : function(){},     // after initialize calendar
        select      : function(){},     // after select the day
        change      : function(){},     // after each change in calendar (just structure changes)
    }

    Object.freeze(MDCalendar.options.lang.days_of);
    Object.freeze(MDCalendar.options.lang.months_of);
    Object.freeze(MDCalendar.options.lang);
    Object.freeze(MDCalendar.options);

    window.MDCalendar = MDCalendar;

})(window, document);
