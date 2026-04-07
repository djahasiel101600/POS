from .models import User


def get_user_by_id(user_id) -> User:
    return User.objects.get(pk=user_id)


def get_all_users(role=None, is_active=None):
    qs = User.objects.all()
    if role is not None:
        qs = qs.filter(role=role)
    if is_active is not None:
        qs = qs.filter(is_active=is_active)
    return qs.order_by('full_name')
