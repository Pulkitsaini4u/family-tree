const FamilyTree = require('./familyTree');

// Define a command-line interface for interacting with the family tree
class CommandLineInterface {
  constructor() {
    this.familyTree = new FamilyTree(); // Create an instance of the FamilyTree class
  }

  // Parse command line arguments and execute corresponding operations
  parseCommandLineArguments(args) {
    while (args.length > 0) {
      let operation = args.shift();
      let gender;
      try {
        switch (operation) {
          case 'add':
            let entityType = args.shift();
            if (entityType === 'person') {
              gender = args.shift();
              if (!['M', 'F'].includes(gender.toUpperCase())) {
                throw new Error('Invalid gender. Use "M" for male or "F" for female.');
              }
              let entityName = args.join(' ');
              this.familyTree.addPerson(entityName, gender);
            } else if (entityType === 'relationship') {
              let relation = args.shift();
              if (!['father', 'son', 'daughter', 'husband', 'wife','brother'].includes(relation)) {
                throw new Error('Invalid relationship type.');
              }
              args.shift();
              let person = args.join(' ');
              this.familyTree.addRelationship(relation, person);
            }
            break;

          case 'connect':
            let person1 = args.slice(0, args.indexOf('as')).join(' ').trim();
            args = args.slice(args.indexOf('as') + 1);
            let relation = args.shift();
            if (!['father', 'son', 'daughter', 'husband', 'wife','brother'].includes(relation)) {
              throw new Error('Invalid relationship type.');
            }
            args.shift(); // Skip 'of'
            // gender = args.shift();
            // if (!['M', 'F'].includes(gender.toUpperCase())) {
            //   throw new Error('Invalid gender. Use "M" for male or "F" for female.');
            // }
            let person2 = args.join(' ');
            this.familyTree.createRelationship(person1, relation, person2, gender);
            break;

          case 'count':
            const countOperation = args.shift();
            if (!['sons', 'daughters'].includes(countOperation)) {
              throw new Error('Invalid count operation. Use "sons" or "daughters".');
            }
            args.shift();
            const personName = args.join(' ');
            console.log(`Count ${countOperation} of ${personName}:`, this.familyTree.countRelationships(personName, countOperation));
            break;

          case 'father':
            args.shift();
            let childName = args.join(' ');
            console.log(`Father of ${childName}:`, this.familyTree.getFather(childName));
            break;

            case 'brother':
              args.shift();
              let brotherName = args.join(' ');
              console.log(`Brother of ${brotherName}:`, this.familyTree.getBrother(brotherName));
              break;
        }
      } catch (error) {
        console.error(`Error during operation: ${error.message}`);
      }
    }
  }

  // Run the command-line interface by parsing command line arguments
  run() {
    let args = process.argv.slice(2);
    this.parseCommandLineArguments(args);
  }
}

// Immediately-invoked function expression (IIFE) to instantiate and run the CommandLineInterface
(() => {
  const cli = new CommandLineInterface();
  cli.run();
})();
