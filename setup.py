from setuptools import setup, find_packages

install_requires = []
with open('requirements.txt') as f:
    for line in f.readlines():
        line = line.strip()
        if line:
            install_requires.append(line)

setup(
    name='dida',
    version='0.0.0',
    author="Lee",
    author_email="294622946@qq.com",
    url='https://github.com/Dog-Egg/dida',
    packages=find_packages(),
    include_package_data=True,
    install_requires=install_requires,
    entry_points={
        'console_scripts': ['dida=dida.cmdline:main']
    }
)
