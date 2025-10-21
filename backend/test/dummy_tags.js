const Tag = require('../models/tag')

const loadTags = async () => {
    let tag = new Tag({ nombre: 'horror', estado: true })
    let tag2 = new Tag({ nombre: 'video juegos', estado: true })
    let tag3 = new Tag({ nombre: 'informatica', estado: false })

    await tag.save()
    await tag2.save()
    await tag3.save()
}

const getTags = async () => {
    let tags = await Tag.find({})
    return tags.map(t => t.toJSON())
}

module.exports = {
    loadTags,
    getTags
}