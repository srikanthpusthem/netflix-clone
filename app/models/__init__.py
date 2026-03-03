# Re-export all models so Alembic (and any importer) can do:
#   from app.models import User, Profile, ...
from app.models.user import User
from app.models.profile import Profile
from app.models.title import Title
from app.models.watch_history import WatchHistory
from app.models.my_list import MyList

__all__ = ["User", "Profile", "Title", "WatchHistory", "MyList"]
