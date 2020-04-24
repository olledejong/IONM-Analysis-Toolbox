# IONM Analysis Toolbox #
*Internship project at the Department of Neurosurgery in the University Medical Center Groningen.*

The Intraoperative Neurophysiological Monitoring (IONM) Analyis Toolbox is a graphical user interface (GUI) designed to make the usage of IONM Analysis tools more user friendly. Realized during an internship at the department of neurosurgery in the university medical center in Groningen. This application has been written in JavaScript using the popular open-source framework named Electron. Electron allows for the development of desktop GUI applications using web technologies.
**Expand this**

### Table of Contents ###

**Create table of contents**

*Instructions below outline installation and set up for windows only.*

#### Installing Python ####
First, install python (version 3.7.1 or newer) through their [website](https://www.python.org). **Make sure to click the 
'add python to PATH' button on the installation wizard**. To confirm that python was added to the `PATH` system variable,
open the command prompt(type 'cmd' in the windows search bar) and type `python`. If python was installed 
correctly, the python interpreter should start and output something like below:

```
Python 3.7.4 (tags/v3.7.4:e09359112e, Jul  8 2019, 19:29:22) [MSC v.1916 32 bit (Intel)] on win32
Type "help", "copyright", "credits" or "license" for more information.
>>>
```

To quit python and return to the command prompt, type `quit()`.
If python does not start upon typing `python`, you may have to [add python to the PATH variable](https://geek-university.com/python/add-python-to-the-windows-path/).

#### Installing the required dependencies ####
The main Python script which runs all tools (ionm.py) depends on the following packages:
- Scipy (depends on and auto-installs numpy)
- Matplotlib (depends on and auto-installs pyparsing, six, python-dateutil, cycler and kiwisolver)
- Pyodbc
- Sqlparse
- Pandas
- Scikit-learn
- Joblib

Dependencies can easily be installed using [pip](https://pypi.org/project/pip/). Pip is the package installer for Python. To install pip, the file [get-pip.py](https://bootstrap.pypa.io/get-pip.py) needs to be downloaded and executed using Python. To do this, open a command prompt (cmd) and type `python` and a single space. Then drag the get-pip.py file into the command prompt. If you did it correctly, you should have something like this: 
`python "C:\Users\(Your logged in User)\Downloads\get-pip.py"`. 
If you do, hit enter and let it do its thing.

**NOTE: Skip this part if you're not using an UMCG machine!** 

If pip is installed on a UMCG non open source computer there will be an extra step before installing the required packages. You will have to navigate to the python its source folder. Open a command prompt and type (replace the parentheses parts):  
`cd C:\Users\(Your logged in User)\AppData\Local\Programs\Python\(Your python version)\Scripts`
Now the `pip install` command can be used.

**NOTE: Continue here if you're not using an UMCG machine!** 

To install the packages, type:  
`pip install scipy matplotlib pyodbc sqlparse pandas sklearn joblib`.  
Hit enter. This will install all required packages and their dependencies.

Now, to test if all dependencies have been successfully installed, head into the python project folder using something like: `cd path\to\python\project`.  
Once in there, type `ionm.py` and hit enter. If all dependencies are there this should produce a help message which describes how to use the command line interface. You can now safely close the command prompt.

#### Installing Microsoft Access / Database Drivers #### 
[Microsoft Access](https://products.office.com/nl-nl/access?rtc=1) is the database program that is used by ionm.py to store signal-derived statistics.
It comes with most versions of the Microsoft Office software. ionm.py was tested with Microsoft Access version 1901.

The Python project communicates with databases using the  [Microsoft Access Database Engine 2010 Redistributable driver](https://www.microsoft.com/en-US/download/details.aspx?id=13255). Please install those drivers, but **be sure to download the 32bit version**, since the application will be published in 32bit only.

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
