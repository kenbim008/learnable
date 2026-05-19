# Generated manually for friendlier Course field labels and help text.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0004_preview_basename_label"),
    ]

    operations = [
        migrations.AlterField(
            model_name="course",
            name="icon_key",
            field=models.CharField(
                "Course icon",
                choices=[
                    ("hat", "Graduation cap"),
                    ("chart", "Chart"),
                    ("at_sign", "At symbol"),
                    ("beaker", "Beaker"),
                    ("book_open", "Open book"),
                    ("briefcase", "Briefcase"),
                    ("calculator", "Calculator"),
                ],
                default="book_open",
                help_text="Small picture next to your course name in lists.",
                max_length=32,
            ),
        ),
        migrations.AlterField(
            model_name="course",
            name="preview_basename",
            field=models.CharField(
                "Preview video (optional)",
                blank=True,
                help_text="Filled in when you add a preview clip.",
                max_length=255,
            ),
        ),
        migrations.AlterField(
            model_name="course",
            name="primary_video_basename",
            field=models.CharField(
                "Main video (optional)",
                blank=True,
                help_text="Filled in when you add a lesson video.",
                max_length=255,
            ),
        ),
        migrations.AlterField(
            model_name="course",
            name="cover_basename",
            field=models.CharField(
                "Cover image (optional)",
                blank=True,
                help_text="Filled in when you add a cover image.",
                max_length=255,
            ),
        ),
    ]
