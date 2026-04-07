from .models import User


def create_user(username: str, full_name: str, role: str, password: str, is_active: bool = True) -> User:
    user = User(username=username, full_name=full_name, role=role, is_active=is_active)
    user.set_password(password)
    user.save()
    return user


def update_user(user: User, **fields) -> User:
    for attr, value in fields.items():
        setattr(user, attr, value)
    user.save(update_fields=list(fields.keys()))
    return user


def reset_password(user: User, new_password: str) -> None:
    user.set_password(new_password)
    user.save(update_fields=['password'])
