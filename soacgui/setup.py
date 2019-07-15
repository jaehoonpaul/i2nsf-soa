import os
from setuptools import find_packages, setup

with open(os.path.join(os.path.dirname(__file__), 'README.rst')) as readme:
    README = readme.read()

# allow setup.py to be run from any path
os.chdir(os.path.normpath(os.path.join(os.path.abspath(__file__), os.pardir)))

setup(
    name='django-soac',
    version='2.0',
    packages=find_packages(),
    include_package_data=True,
    license='MIT License',
    description='SOAC is an openstack based cloud service.',
    long_description=README,
    url='http://www.etri.com/',
    author='jinsik kang',
    author_email='jskang@chironsoft.com',
    classifiers=[
        'Environment :: Web Environment',
        'Framework :: Django',
        'Framework :: Django :: 1.11',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Operating System :: Linux',
        'Programming Language :: Python',
        'Programming Language :: Python :: 2.7.14',
        'Topic :: Internet :: WWW/HTTP',
    ],
)