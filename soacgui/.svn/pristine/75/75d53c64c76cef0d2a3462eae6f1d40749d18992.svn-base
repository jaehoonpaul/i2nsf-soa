import datetime
import json

from django import template
register = template.Library()


class SetVarNode(template.Node):

    def __init__(self, var_name, var_value):
        self.var_name = var_name
        self.var_value = var_value

    def render(self, context):
        try:
            value = template.Variable(self.var_value).resolve(context)
        except template.VariableDoesNotExist:
            value = ""
        context[self.var_name] = value

        return u""


@register.tag(name="set")
def set_var(parser, token):
    """
    {% set some_var = '123' %}
    """
    parts = token.split_contents()
    if len(parts) < 4:
        raise template.TemplateSyntaxError("'set' tag must be of the form: {% set <var_name> = <var_value> %}")

    return SetVarNode(parts[1], parts[3])


@register.simple_tag
def get_dict(the_dict, key):
    return the_dict.get(key, '')


@register.simple_tag
def equal_value_in_list(value, confirm_list, true_str, false_str):
    for v in confirm_list:
        if type(v) == dict:
            for key, val in v.items():
                if value == val:
                    return true_str
        else:
            if value == v:
                return true_str
    return false_str


@register.filter(name="range")
def _range(_min, args=None):
    """
    {% for value in 5|range %}
    {% for value in 5|range:10 %}
    {% for value in 5|range:"10,2" %}
    :param _min:
    :param args:
    :return:
    """
    _max, _step = None, None
    if args:
        if not isinstance(args, int):
            _max, _step = map(int, args.split(','))
        else:
            _max = args
    args = filter(None, (_min, _max, _step))
    result = range(*args)
    return result


@register.filter(name='mod')
def mod(value, arg):
    return value % arg


@register.simple_tag
def parse_json(dic):
    return json.dumps(dic).replace("\"", "'")


@register.simple_tag
def parse_time_format(time):
    date_format = "%Y-%m-%dT%H:%M:%S.%f"
    return datetime.datetime.strptime(time, date_format)


@register.simple_tag
def parse_time_format_z(time):
    date_format = "%Y-%m-%dT%H:%M:%SZ"
    return datetime.datetime.strptime(time, date_format)


@register.filter
def get_type(value):
    return type(value)