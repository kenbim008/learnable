from django import template

from courses.categories import category_label

register = template.Library()


@register.filter
def course_category_label(value):
    return category_label(value) if value else ""
