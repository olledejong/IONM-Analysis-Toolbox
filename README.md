# IONM Analysis Toolbox #
*Internship project at the Department of Neurosurgery in the University Medical Center Groningen.*

The Intraoperative Neurophysiological Monitoring (IONM) Analyis Toolbox is a graphical user interface (GUI) designed to make the usage of IONM Analysis tools more user friendly. Realized during an internship at the department of neurosurgery in the university medical center in Groningen. This application has been written in JavaScript using the popular open-source framework named Electron. Electron allows for the development of desktop GUI applications using web technologies.
**Expand this**

### Table of Contents ###

**Create table of contents**

*Instructions below outline installation and set up for windows only.*

#### Installing python ####
First, install python(version 3.7.1 or newer) through their [website](https://www.python.org). Make sure to click the 
'add python to PATH' button on the installation wizard. To confirm that python was added to the `PATH` system variable,
open the command prompt(type 'cmd' in the windows search bar) and type `python` or `python3`. If python was installed 
correctly, the python interpreter should start and output something like below:

```
Python 3.7.4 (tags/v3.7.4:e09359112e, Jul  8 2019, 19:29:22) [MSC v.1916 32 bit (Intel)] on win32
Type "help", "copyright", "credits" or "license" for more information.
>>>
```

To quit python and return to the command prompt, type `quit()`.
If python does not start upon typing `python`, you may have to [add python to the PATH variable](https://geek-university.com/python/add-python-to-the-windows-path/).

Similarly, `pip` should also work as a command from the command prompt.
#### Installing dependencies ####
ionm.py(the main script) depends on the following packages:
- Scipy(depends on numpy)
- Matplotlib(depends on pyparsing, six, python-dateutil, cycler and kiwisolver)
- Pyodbc
- Sqlparse
- Pandas
- Scikit-learn
- Joblib

To install pip, the file [Get-pip.py](https://bootstrap.pypa.io/get-pip.py) needs to be downloaded and executed with python.

If `pip` is installed on a UMCG non open source computer there will be an extra step before installing the packages.
`pip` will be installed in the folder "C:\Users\(Your logged in User)\AppData\Local\Programs\Python\(Your python version)\Scripts".
Via the commandline you can access this folder by typing `cd` + the path above. If the user is in this folder the `pip install` command can be used.

To install the packages, open the command prompt and type `python -m pip install scipy matplotlib pyodbc sqlparse pandas sklearn joblib`. 
This will install all required packages and their dependencies.

After installing these dependencies, running `ionm.py` with no arguments should run with no errors and produce a help message. 

#### Installing Microsoft Access and database drivers #### 
[Microsoft Access](https://products.office.com/nl-nl/access?rtc=1) is the database program that is used by ionm.py to store signal-derived statistics.
It comes with most versions of the Microsoft Office software. ionm.py was tested with Microsoft Access version 1901.

ionm.py uses the [Microsoft Access Database Engine 2010 Redistributable driver](https://www.microsoft.com/en-US/download/details.aspx?id=13255)
to communicate with the database. Make sure that it is installed.

#### Setting up the database ####
Can now be done via IONM Analysis Toolbox application later in the process.
**Expand this**

After running `ionm.py setup`, opening the database file should start Access and show a database with empty tables.

#### Version Information ####

All information about the IONM Analysis Toolbox app, as well as the initial Python Project its information, can be found within the IONM Analysis Toolbox app under the 'About' section. This information also includes the version information.  
On every start-up the application checks whether there is an update available. It does this by checking the project its [Github releases page](https://github.com/olledejong/IONM-Analysis-Toolbox/releases).

### Usage ###

**Describe usage of all tools via IONM Analysis Toolbox application**

### Contacts ###

- IONM Analysis Toolbox, developed by Olle de Jong (olledejong@gmail.com; ol.de.jong@st.hanze.nl)

- Python IONM analysis project, initiated by Johan Schneiders (j.schneiders@st.hanze.nl; johan.schneiders@live.com)

- Python IONM analysis project, expanded and optimized by Menno Gerbens (m.j.gerbens@st.hanze.nl; mennogerbens@gmail.com)
