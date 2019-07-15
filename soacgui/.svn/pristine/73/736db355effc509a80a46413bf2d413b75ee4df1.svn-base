=================================
Security On Air Controller (SOAC)
=================================

SOAC is an openstack based cloud service. The complex functions of openstack
can be easily configured in a virtual environment with wysiwyg.

Detailed documentation is in the "docs" directory.

Quick start
-----------

1. Add "polls" to your INSTALLED_APPS setting like this::

    INSTALLED_APPS = [
        ...
        'polls',
    ]

2. Include the polls URLconf in your project urls.py like this::

    path('polls/', include('polls.urls')),

3. Run `python manage.py migrate` to create the polls models.

4. Start the development server and visit http://127.0.0.1:8000/
   to create a poll (you'll need the Admin app enabled).

5. Visit http://127.0.0.1:8000/ to participate in the poll.