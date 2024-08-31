const fs = require('fs');

// Define a Person class to represent individuals in the family tree
class Person {
  constructor(name, gender) {
    this.name = name;
    this.gender = gender;
    this.relationships = []; // Relationships associated with the person
  }
}

// Define a FamilyTree class to manage the family tree data
class FamilyTree {
  constructor() {
    this.familyTree = []; // Array to store individuals in the family tree

    // Load family tree data on initialization
    this.loadFamilyTree();

    // Save family tree data on script exit
    process.on('exit', () => {
      this.saveFamilyTree();
    });
  }

  // Load family tree data from the file
  loadFamilyTree() {
    try {
      const data = fs.readFileSync('familyTree.json', 'utf-8');
      this.familyTree = JSON.parse(data).map(personData => {
        // Create Person instances from loaded data
        const person = new Person(personData.name, personData.gender);
        person.relationships = personData.relationships;
        return person;
      });
    } catch (error) {
      this.familyTree = [];
      if (error.code === 'ENOENT') {
        // If file not found, create a new one
        fs.writeFileSync('familyTree.json', JSON.stringify(this.familyTree, null, 2), 'utf-8');
      } else {
        console.error(`Error loading family tree: ${error.message}`);
      }
    }
  }

  // Save family tree data to the file
  saveFamilyTree() {
    try {
      fs.writeFileSync('familyTree.json', JSON.stringify(this.familyTree, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Error saving family tree: ${error.message}`);
    }
  }

  // Find the index of a person in the family tree
  findPersonIndex(name) {
    return this.familyTree.findIndex((person) => person.name === name);
  }

  // Add a new person to the family tree
  addPerson(name, gender) {
    try {
      if (this.findPersonIndex(name) === -1) {
        // Add a new Person instance to the family tree
        const newPerson = new Person(name, gender.toUpperCase() === 'M' ? 'male' : 'female');
        this.familyTree.push(newPerson);
      }
    } catch (error) {
      console.error(`Error adding person: ${error.message}`);
    }
  }

  // Add a relationship between two persons
  addRelationship(relationType, relatedPersonName) {
    try {
      this.addPerson(relatedPersonName);
      const personIndex = this.findPersonIndex(relatedPersonName);
      const existingRelation = this.familyTree[personIndex].relationships.find(
        (relation) => relation.type === relationType
      );
      if (!existingRelation) {
        // If the relationship type doesn't exist, add a new relationship
        this.familyTree[personIndex].relationships.push({
          type: relationType,
          person: relationType === 'father' ? '' : []
        });
      }
    } catch (error) {
      console.error(`Error adding relationship: ${error.message}`);
    }
  }

  // Create a relationship between two persons based on the type of relationship
  createRelationship(person1Name, relationType, person2Name, gender) {
    try {
    
            const person1Index = this.findPersonIndex(person1Name);
            const person2Index = this.findPersonIndex(person2Name);
            let person1Gender = this.familyTree[person2Index].gender === 'male' ? 'M': 'F';

      // Define the gender lookup based on the relationship type
      let genderLookup = {
        'father': { gender1: 'M', gender2: person1Gender },
        'son': { gender1: 'M', gender2: person1Gender },
        'daughter': { gender1: 'F', gender2: person1Gender },
        'wife': { gender1: 'F', gender2: person1Gender },
        'husband': { gender1: 'M', gender2: person1Gender },
        'brother': { gender1: 'M', gender2: person1Gender },
      };

      let { gender1, gender2 } = genderLookup[relationType] || {};
      this.addPerson(person1Name, gender1);
      this.addPerson(person2Name, gender2);
      switch (relationType) {
        case 'father':
          this.createOrUpdateRelationship(person1Index, person2Name, person1Gender === 'M' ? 'son' : 'daughter');
          this.createOrUpdateRelationship(person2Index, person1Name, 'father');

          break;

        case 'son':
          this.createOrUpdateRelationship(person1Index, person2Name, 'father');
          this.createOrUpdateRelationship(person2Index, person1Name, 'son');
          break;

        case 'daughter':
          this.createOrUpdateRelationship(person1Index, person2Name, 'father');
          this.createOrUpdateRelationship(person2Index, person1Name, 'daughter');
          break;

        case 'husband':
          this.createOrUpdateRelationship(person1Index, person2Name, 'wife');
          this.createOrUpdateRelationship(person2Index, person1Name, 'husband');
          break;

        case 'wife':
          this.createOrUpdateRelationship(person1Index, person2Name, 'husband');
          this.createOrUpdateRelationship(person2Index, person1Name, 'wife');
          break;

          case 'brother':
          this.createOrUpdateRelationship(person1Index, person2Name, 'brother');
          this.createOrUpdateRelationship(person2Index, person1Name, 'brother');
          break;
      }
    } catch (error) {
      console.error(`Error creating relationship: ${error.message}`);
    }
  }

  // Create or update a relationship between two persons
  createOrUpdateRelationship(personIndex, relatedPersonName, relatedType) {
    try {
      const typeIndex = this.familyTree[personIndex].relationships.findIndex(
        (relation) => relation.type === relatedType
      );
      if (typeIndex === -1) {
        // If the relationship type doesn't exist, create a new one
        this.familyTree[personIndex].relationships.push({
          type: relatedType,
          person: relatedType === 'father' || relatedType === 'wife' || relatedType === 'husband' ? relatedPersonName : [relatedPersonName],
        });
      } else {
        // If the relationship type exists, update the person list
        relatedType === 'father' || relatedType === 'wife' || relatedType === 'husband' ?
          this.familyTree[personIndex].relationships[typeIndex].person = relatedPersonName :
          this.familyTree[personIndex].relationships[typeIndex].person.includes(relatedPersonName) ? '' :
          this.familyTree[personIndex].relationships[typeIndex].person.push(relatedPersonName)
      }
    } catch (error) {
      console.error(`Error creating or updating relationship: ${error.message}`);
    }
  }

  // Count the number of relationships of a specific type for a person
  countRelationships(personName, relationType) {
    try {
      const personIndex = this.findPersonIndex(personName);
      relationType = relationType === 'sons' ? 'son' : 'daughter';
      if (personIndex !== -1) {
        let data = this.familyTree[personIndex].relationships.filter(
          (relationship) => relationship.type === relationType
        );
        return data[0].person.length;
      }
      return 0;
    } catch (error) {
      console.error(`Error counting relationships: ${error.message}`);
      return 0;
    }
  }

  // Get the father of a person
  getFather(personName) {
    try {
      const personIndex = this.findPersonIndex(personName);
      if (personIndex !== -1) {
        const fathers = this.familyTree[personIndex].relationships.filter(
          (relationship) => relationship.type === 'father'
        );
        return fathers.length > 0 ? fathers[0].person : null;
      }
      return null;
    } catch (error) {
      console.error(`Error getting father: ${error.message}`);
      return null;
    }
  }

getBrother(personName) {
  try {
    const personIndex = this.findPersonIndex(personName);
    if (personIndex !== -1) {
      const brother = this.familyTree[personIndex].relationships.filter(
        (relationship) => relationship.type === 'brother'
      );
      return brother.length > 0 ? brother[0].person : null;
    }
    return null;
  } catch (error) {
    console.error(`Error getting father: ${error.message}`);
    return null;
  }
}
}

module.exports = FamilyTree;
