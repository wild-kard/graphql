const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const {
GraphQLSchema,
GraphQLObjectType,
GraphQLString,
GraphQLList,
GraphQLInt,
GraphQLNonNull
} = require('graphql')

const app = express()

// dummy data
const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]
//dummy data
const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const BookType = new GraphQLObjectType ({
    name: 'Book',
    description: 'This is a book written by an author',
    fields: ()=>({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        //below is the magic query that signifies the power of GraphQL as a normal query for the below information would require multiple queries 
        //to obtain the list of books for each author independently. As well, it would return additional unnecessary information as well. 
        author: { 
            type: AuthorType,
            resolve: (book)=>{
                return authors.find(author => author.id === book.authorId)
            }
         }
    })
})

const AuthorType = new GraphQLObjectType ({
    name: 'Author',
    description: 'This is an author',
    fields: ()=>({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: { type: new GraphQLList(BookType),
        resolve: (author)=>{
            return books.filter(book => book.authorId === author.id)
        }
     }
    })
})


const RootQueryType = new GraphQLObjectType ({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'A single Book',
            args: {

                id: { type: GraphQLInt }
            },
            //below is where you would query the db for books if you had one
            resolve: (parent, args)=> books.find(book => book.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of all Books',
            //below is where you would query the db for books if you had one
            resolve: ()=> books
        },
        author: {
            type: AuthorType,
            description: 'A single Author',
            args: {

                id: { type: GraphQLInt }
            },
            //below is where you would query the db for books if you had one
            resolve: (parent, args)=> authors.find(author => author.id === args.id)
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of all Authors',
            //below is where you would query the db for books if you had one
            resolve: ()=> authors
        }

    })
})

const RootMutationType = new GraphQLObjectType({
    name: "Mutation",
    description: "Root Mutation",
    fields: ()=>({
        addBook: { type: BookType,
        description: 'Add a Book',
        args: {
            name: {
                type: GraphQLNonNull(GraphQLString)
            },
            authorId: {
                type: GraphQLNonNull(GraphQLInt)
            }
        },
        resolve: (parent, args) => {
            const book = {id: books.length + 1, name: args.name, authorId: args.authorId}
            books.push(book)
            return book
        }
    }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))

app.listen(5000., () => console.log('the server is running'))