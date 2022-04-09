const express = require('express')
const router = express.Router()
const Note = require('../models/note')
const WithAuth = require('../middlewares/auth')

router.post('/', WithAuth, async (req, res) => {
  const { title, body } = req.body

  try {
    const note = new Note({ title, body, author: req.user._id })
    await note.save()
    res.status(200).json(note)
  } catch (err) {
    res.status(500).json({ error: 'Problem to create a note' })
  }
})

router.get('/search', WithAuth, async (req, res) => {
  const { query } = req.query

  try {
    const notes = await Note
      .find({ author: req.user._id })
      .find({ $text: { $search: query } })

    res.json(notes)
  } catch (error) {
    res.status(500).json({ error })
  }
})

router.get('/:id', WithAuth, async (req, res) => {
  try {
    const { id } = req.params
    const note = await Note.findById(id)

    if (isOwner(req.user, note)) {
      res.json(note)
    } else {
      res.status(403).json({ error: 'Permission denied' })
    }
  } catch (err) {
    res.status(500).json({ error: 'Problem to get a note' })
  }
})



router.get('/', WithAuth, async (req, res) => {
  try {
    const notes = await Note.find({ author: req.user._id })
    res.json(notes)
  } catch (error) {
    res.status(500).json({ error })
  }
})

router.put('/:id', WithAuth, async (req, res) => {
  const { title, body } = req.body
  const { id } = req.params
  try {
    const note = await Note.findById(id)
    if (isOwner(req.user, note)) {
      const note = await Note.findOneAndUpdate(id, {
        $set: { title, body },
      },
        { upsert: true, 'new': true }
      )
      res.json(note)
    } else {
      res.status(403).json({ error: 'Permission denied' })
    }
  } catch (err) {
    res.status(500).json({ error: 'Problem to update a note' })
  }
})

router.delete('/:id', WithAuth, async (req, res) => {
  const { id } = req.params

  try {
    const note = await Note.findById(id)
    if (isOwner(req.user, note)) {
      await note.delete()
      res.status(204).json({ message: 'OK' })
    } else {
      res.status(403).json({ error: 'Permission denied' })
    }
  } catch (err) {
    res.status(500).json({ error: 'Problem to delete a note' })
  }
})

const isOwner = (user, note) =>
  JSON.stringify(user._id) === JSON.stringify(note.author._id)

module.exports = router