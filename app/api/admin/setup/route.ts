import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST() {
  try {
    // Run Prisma db push to initialize the database schema
    const { stdout, stderr } = await execAsync('npx prisma db push --skip-generate')

    if (stderr && !stderr.includes('warnings')) {
      console.error('Setup stderr:', stderr)
      return NextResponse.json(
        { error: 'Error setting up database', details: stderr },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Database schema initialized successfully!',
      output: stdout,
    })
  } catch (error) {
    console.error('Error setting up database:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
