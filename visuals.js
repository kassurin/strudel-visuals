// =======================
// 1. MOTOR VISUAL
// =======================

if (!window.vx) {
  window.vx = {}
}

if (window.vx.raf) {
  cancelAnimationFrame(window.vx.raf)
}

if (!window.vx.canvas) {
  window.vx.canvas = document.createElement('canvas')
  window.vx.canvas.id = 'strudelCanvas'
  window.vx.canvas.style =
    'position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:0; pointer-events:none;'
  document.body.appendChild(window.vx.canvas)
}

window.vx.ctx = window.vx.canvas.getContext('2d')
window.vx.canvas.width = innerWidth
window.vx.canvas.height = innerHeight
window.vx.layers = []


// =======================
// 2. GRID VISUAL
// =======================

function grid(cells, cols, rows, showGrid) {
  return {
    type: "grid",
    cells: cells,
    cols: cols,
    rows: rows,
    impacts: Array(cols * rows).fill(0),
    decay: 0.93,
    baseRadius: 18,
    gain: 80,

    // padrão agora é NÃO mostrar grid
    showGrid: showGrid === true
  }
}


// =======================
// 3. DESENHO DO GRID
// =======================

function drawGridLayer(layer) {
  var ctx = window.vx.ctx
  var canvas = window.vx.canvas
  var cellW = canvas.width / layer.cols
  var cellH = canvas.height / layer.rows
  var total = layer.cols * layer.rows

  for (var i = 0; i < total; i++) {
    var col = i % layer.cols
    var row = Math.floor(i / layer.cols)

    var x = col * cellW
    var y = row * cellH
    var cx = x + cellW / 2
    var cy = y + cellH / 2

    var impact = layer.impacts[i] || 0
    var radius = layer.baseRadius + impact * layer.gain

    if (layer.showGrid) {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, cellW, cellH)
    }

    ctx.strokeStyle = 'rgba(0,195,255,0.8)'
    ctx.lineWidth = 2 + impact * 6
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.stroke()

    layer.impacts[i] = layer.impacts[i] * layer.decay
  }
}


// =======================
// 4. LOOP VISUAL
// =======================

function vxLoop() {
  var ctx = window.vx.ctx
  var canvas = window.vx.canvas

  ctx.fillStyle = 'rgba(10,10,25,0.2)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (var i = 0; i < window.vx.layers.length; i++) {
    drawGridLayer(window.vx.layers[i])
  }

  window.vx.raf = requestAnimationFrame(vxLoop)
}

window.vx.raf = requestAnimationFrame(vxLoop)


// =======================
// 5. PONTE STRUDEL
// =======================

register('visuals', function (spec, pat) {
  var layer = spec
  var id = window.vx.layers.length

  window.vx.layers.push(layer)

  return pat.superimpose(
    function (x) {
      return x
        .n(layer.cells)
        .gain(0)
        .onTrigger(function (e) {
          var raw = 0

          if (e.value && e.value.n !== undefined) {
            raw = e.value.n
          } else if (e.n !== undefined) {
            raw = e.n
          } else if (e.value !== undefined) {
            raw = e.value
          } else if (e.note !== undefined) {
            raw = e.note
          } else if (e.number !== undefined) {
            raw = e.number
          }

          var total = layer.cols * layer.rows
          var cell = Math.floor(Number(raw)) % total

          if (cell < 0) {
            cell = cell + total
          }

          window.vx.layers[id].impacts[cell] = 1
        })
    }
  )
})

/*
// =======================
// 6. MÚSICA + VISUAIS
// =======================

t1: s("bd").visuals(grid("0 1 2 3", 3, 3))

t2: s("~ sd ~ sd").visuals(grid("4 5 6 7", 2, 2))

t3: s("hh*8").gain(0.4).visuals(grid(rand.range(0, 12), 8, 8))

t4: s("cp*2").visuals(grid(sine.range(12, 15), 6, 4))
  */
