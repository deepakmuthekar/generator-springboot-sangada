'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

const { exec } = require("child_process");

module.exports = class extends Generator {

  initializing() {
    this.log('Initialization started ...')
  }

  prompting() {

    this.log(
      yosay(`Welcome underpin scaffold ${chalk.red('generator-gradle-boot')} generator!`)
    );

    const prompts = [
      {
        type: 'string',
        name: 'bootVersion',
        message: 'Enter Spring Boot version:',
        default: '2.3.2.RELEASE'
      },
      {
        type: 'list',
        name: 'appType',
        message: 'What kind of component you are building?',
        default: 'microservice',
        choices: ['microservice', 'library']
      },
      {
        type: 'string',
        name: 'appName',
        message: 'What is your application name?',
        default: 'myservice'
      },
      {
        type: 'string',
        name: 'projectDescription',
        message: 'Project description',
        default: 'project_description goes here'
      },
      
      {
        type: 'list',
        name: 'buildTool',
        message: 'Which build tool you want to use?',
        default: 'gradle',
        choices: ['gradle', 'maven']
      },
      {
        type: 'string',
        name: 'rootPackage',
        message: 'Root package name?',
        default: 'com.myorg.myservice'
      },
      {
        type: 'string',
        name: 'java_version',
        message: 'Java Version?',
        default: '11'
      },
      
      {
        type: 'confirm',
        name: 'someAnswer',
        message: 'Would you like to enable this option?',
        default: true
      },
      {
        type: 'checkbox',
        name: 'dependencies',
        message: 'DevOps dependencies?',
        choices: ['actuator', 'lombok', 'mapstruct', 'vavr']
      }

    ];

    return this.prompt(prompts).then(props => {
      this.props = props;
    });
  }

  writing() {

    var rootPackageName = this.props.rootPackage
    var basePackageName = rootPackageName.replace('/\./gi', '/');
    var javaSrcDir = '/src/main/java'
    var resourcesDir = '/src/main/resources'

    console.log(this.props)


    this.fs.copyTpl(
      this.templatePath('Application.java'),
      this.destinationPath(`${this.props.appName}/${javaSrcDir}/${basePackageName}/Application.java`),
      {
        root_package: this.props.rootPackage
      }
    );

    this.fs.copyTpl(
      this.templatePath('application.properties'),
      this.destinationPath(`${this.props.appName}/${resourcesDir}/application.properties`)
    );

    if ("gradle" == this.props.buildTool) {

      this.fs.copyTpl(
        this.templatePath('build.gradle'),
        this.destinationPath(`${this.props.appName}/build.gradle`),
        {
          java_version: this.props.java_version,
          lombok: this.props.dependencies.indexOf('lombok') !== -1,
          vavr: this.props.dependencies.indexOf('vavr') !== -1,
          mapstruct: this.props.dependencies.indexOf('mapstruct') !== -1,
          actuator: this.props.dependencies.indexOf('actuator') !== -1
        }
      );

      this.fs.copyTpl(
        this.templatePath('settings.gradle'),
        this.destinationPath(`${this.props.appName}/settings.gradle`),
        {
          root_project_name: this.props.appName
        }
      );

      this.fs.copyTpl(
        this.templatePath('gradle.properties'),
        this.destinationPath(`${this.props.appName}/gradle.properties`)
      );
    }

    if ('maven' == this.props.buildTool) {
      this.fs.copyTpl(
        this.templatePath('pom.xml'),
        this.destinationPath(`${this.props.appName}/pom.xml`),
        {
          root_project_name: this.props.appName,
          boot_version: this.props.bootVersion,
          java_version: this.props.java_version,
          project_description: this.props.projectDescription 
        }
      );
    }


  }

  install() {
    this.log('Installing dependencies and ininitializing git repo...')

    var buildToolCmd;
    if ("gradle" == this.props.buildTool) {
      buildToolCmd = 'gradle wrapper'
    } else if ("maven" == this.props.buildTool) {
      buildToolCmd = 'mvn clean install'
    }

    exec(`cd ${this.props.appName} && ${buildToolCmd} && git init`, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      this.log(`Project ${this.props.appName} generated successfully`);
    });

  }

};
