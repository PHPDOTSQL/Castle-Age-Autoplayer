
////////////////////////////////////////////////////////////////////
//                          sort OBJECT
// this is the main object for dealing with sort routines
/////////////////////////////////////////////////////////////////////

sort = {
    by: function (reverse, name, minor) {
        return function (o, p) {
            try {
                var a, b;
                if ($j.type(o) === 'object' && $j.type(p) === 'object' && o && p) {
                    a = o[name];
                    b = p[name];
                    if (a === b) {
                        return $j.type(minor) === 'function' ? minor(o, p) : o;
                    }

                    if ($j.type(a) === $j.type(b)) {
                        if (reverse) {
                            return a < b ? 1 : -1;
                        } else {
                            return a < b ? -1 : 1;
                        }
                    }

                    if (reverse) {
                        return $j.type(a) < $j.type(b) ? 1 : -1;
                    } else {
                        return $j.type(a) < $j.type(b) ? -1 : 1;
                    }
                } else {
                    throw {
                        name: 'Error',
                        message: 'Expected an object when sorting by ' + name
                    };
                }
            } catch (err) {
                utility.error("ERROR in sort.by: " + err);
                return undefined;
            }
        };
    },

    objectBy: function (obj, sortfunc, deep) {
        try {
            var list   = [],
                output = {},
                i      = 0,
                j      = '',
                len    = 0;

            if (typeof deep === 'undefined') {
                deep = false;
            }

            for (j in obj) {
                if (obj.hasOwnProperty(j)) {
                    list.push(j);
                }
            }

            list.sort(sortfunc);
            for (i = 0, len = list.length; i < len; i += 1) {
                if (deep && $j.isPlainObject(obj[list[i]])) {
                    output[list[i]] = caap.SortObject(obj[list[i]], sortfunc, deep);
                } else {
                    output[list[i]] = obj[list[i]];
                }
            }

            return output;
        } catch (err) {
            utility.error("ERROR in sort.objectBy: " + err);
            return undefined;
        }
    },

    dialog: {},

    form: function (id, list, records) {
        try {
            var html      = '',
                it        = 0,
                it1       = 0,
                len1      = 0;

            if (!sort.dialog[id] || !sort.dialog[id].length) {
                list.unshift("");
                html += "<p>Sort by ...</p>";
                for (it = 0; it < 3; it += 1) {
                    html += "<div style='padding-bottom: 30px;'>";
                    html += "<div style='float: left; padding-right: 30px;'>";
                    html += "<form id='form" + it + "'>";
                    html += "<input type='radio' id='asc" + it + "' name='reverse' value='false' checked /> Ascending<br />";
                    html += "<input type='radio' id='des" + it + "' name='reverse' value='true' /> Descending";
                    html += "</form>";
                    html += "</div>";
                    html += "<div>";
                    html += "<select id='select" + it + "'>";
                    for (it1 = 0, len1 = list.length; it1 < len1; it1 += 1) {
                        html += "<option value='" + list[it1] + "'>" + list[it1] + "</option>";
                    }

                    html += "</select>";
                    html += "</div>";
                    html += "</div>";
                    if (it < 2) {
                        html += "<p>Then by ...</p>";
                    }
                }

                sort.dialog[id] = $j('<div id="sort_form_' + id + '" title="Sort ' + id + '">' + html + '</div>').appendTo(window.document.body);
                sort.dialog[id].dialog({
                    buttons: {
                        "Sort": function () {
                            sort.getForm(id, records);
                            $j(this).dialog("close");
                        },
                        "Cancel": function () {
                            $j(this).dialog("close");
                        }
                    }
                });
            } else {
                sort.dialog[id].dialog("open");
            }

            sort.updateForm(id);
            return true;
        } catch (err) {
            utility.error("ERROR in sort.form: " + err);
            return false;
        }
    },

    getForm: function (id, records) {
        try {
            var order = {
                    reverse: {
                        a: false,
                        b: false,
                        c: false
                    },
                    value: {
                        a: '',
                        b: '',
                        c: ''
                    }
                };

            if (sort.dialog[id] && sort.dialog[id].length) {
                order.reverse.a = $j("#form0 input[name='reverse']:checked", sort.dialog[id]).val() === "true" ? true : false;
                order.reverse.b = $j("#form1 input[name='reverse']:checked", sort.dialog[id]).val() === "true" ? true : false;
                order.reverse.c = $j("#form2 input[name='reverse']:checked", sort.dialog[id]).val() === "true" ? true : false;
                order.value.a = $j("#select0 option:selected", sort.dialog[id]).val();
                order.value.b = $j("#select1 option:selected", sort.dialog[id]).val();
                order.value.c = $j("#select2 option:selected", sort.dialog[id]).val();
                records.sort(sort.by(order.reverse.a, order.value.a, sort.by(order.reverse.b, order.value.b, sort.by(order.reverse.c, order.value.c))));
                state.setItem(id + "Sort", order);
                state.setItem(id + "DashUpdate", true);
                caap.UpdateDashboard(true);
            } else {
                utility.warn("Dialog for getForm not found", id);
            }

            return order;
        } catch (err) {
            utility.error("ERROR in sort.getForm: " + err);
            return undefined;
        }
    },

    updateForm: function (id) {
        try {
            var order = {
                    reverse: {
                        a: false,
                        b: false,
                        c: false
                    },
                    value: {
                        a: '',
                        b: '',
                        c: ''
                    }
                };

            if (sort.dialog[id] && sort.dialog[id].length) {
                $j.extend(true, order, state.getItem(id + "Sort", order));
                $j("#form0 input", sort.dialog[id]).val([order.reverse.a]);
                $j("#form1 input", sort.dialog[id]).val([order.reverse.b]);
                $j("#form2 input", sort.dialog[id]).val([order.reverse.c]);
                $j("#select0", sort.dialog[id]).val(order.value.a);
                $j("#select1", sort.dialog[id]).val(order.value.b);
                $j("#select2", sort.dialog[id]).val(order.value.c);
            } else {
                utility.warn("Dialog for updateForm not found", id, sort.dialog[id]);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in sort.updateForm: " + err);
            return false;
        }
    }
};
